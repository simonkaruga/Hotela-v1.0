import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TransactionType } from '@prisma/client';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

// Default folio -> GL account mapping. Every charge debits Accounts Receivable (1100)
// and credits the relevant revenue account; every payment/refund moves the balance
// between Cash (1000) and AR. This is ONE reasonable convention, chosen and documented
// here rather than left undecided -- change the codes below if the property's real
// chart of accounts differs.
const CHARGE_CREDIT_ACCOUNT_CODE: Partial<Record<TransactionType, string>> = {
  ROOM_CHARGE: '4000',
  FNB_CHARGE: '4100',
  SPA_CHARGE: '4200',
  TAX: '2100',
};
const AR_ACCOUNT_CODE = '1100';
const CASH_ACCOUNT_CODE = '1000';
const ADJUSTMENTS_ACCOUNT_CODE = '4900';

@Injectable()
export class GeneralLedgerService {
  constructor(private readonly prisma: PrismaService) {}

  createAccount(dto: CreateAccountDto) {
    return this.prisma.account.create({ data: dto });
  }

  findAccounts(propertyId?: string) {
    return this.prisma.account.findMany({ where: { propertyId }, orderBy: { code: 'asc' } });
  }

  async createJournalEntry(dto: CreateJournalEntryDto) {
    for (const line of dto.lines) {
      const hasDebit = line.debit > 0;
      const hasCredit = line.credit > 0;
      if (hasDebit === hasCredit) {
        throw new BadRequestException('Each journal line must have either a debit or a credit, not both or neither');
      }
    }

    const totalDebits = dto.lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredits = dto.lines.reduce((sum, l) => sum + l.credit, 0);
    if (Math.round((totalDebits - totalCredits) * 100) !== 0) {
      throw new BadRequestException(`Journal entry does not balance: debits ${totalDebits} != credits ${totalCredits}`);
    }

    const accountIds = dto.lines.map((l) => l.accountId);
    const accounts = await this.prisma.account.findMany({ where: { id: { in: accountIds } } });
    if (accounts.length !== new Set(accountIds).size) {
      throw new BadRequestException('One or more accounts were not found');
    }
    if (accounts.some((a) => a.propertyId !== dto.propertyId)) {
      throw new BadRequestException('All accounts must belong to the same property as the journal entry');
    }

    return this.prisma.journalEntry.create({
      data: {
        propertyId: dto.propertyId,
        date: new Date(dto.date),
        description: dto.description,
        lines: { create: dto.lines.map((l) => ({ accountId: l.accountId, debit: l.debit, credit: l.credit })) },
      },
      include: { lines: { include: { account: true } } },
    });
  }

  findJournalEntries(propertyId?: string) {
    return this.prisma.journalEntry.findMany({
      where: { propertyId },
      include: { lines: { include: { account: true } } },
      orderBy: { date: 'desc' },
    });
  }

  async getTrialBalance(propertyId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { propertyId },
      include: { journalLines: true },
      orderBy: { code: 'asc' },
    });

    const rows = accounts.map((account) => {
      const debit = account.journalLines.reduce((sum, l) => sum + Number(l.debit), 0);
      const credit = account.journalLines.reduce((sum, l) => sum + Number(l.credit), 0);
      return {
        accountId: account.id,
        code: account.code,
        name: account.name,
        type: account.type,
        debit,
        credit,
        balance: debit - credit,
      };
    });

    const totalDebits = Math.round(rows.reduce((sum, r) => sum + r.debit, 0) * 100) / 100;
    const totalCredits = Math.round(rows.reduce((sum, r) => sum + r.credit, 0) * 100) / 100;

    return { rows, totalDebits, totalCredits, balanced: totalDebits === totalCredits };
  }

  async postFolioToGl(folioId: string) {
    const folio = await this.prisma.folio.findUnique({
      where: { id: folioId },
      include: { transactions: true, reservation: true },
    });
    if (!folio) {
      throw new NotFoundException(`Folio ${folioId} not found`);
    }

    const propertyId = folio.reservation.propertyId;
    const accounts = await this.prisma.account.findMany({ where: { propertyId } });
    const accountByCode = new Map(accounts.map((a) => [a.code, a]));
    const getAccount = (code: string) => {
      const account = accountByCode.get(code);
      if (!account) {
        throw new BadRequestException(`Chart of accounts is missing required account code ${code}`);
      }
      return account;
    };

    const unposted = folio.transactions.filter((t) => !t.journalEntryId);
    const posted: string[] = [];

    for (const transaction of unposted) {
      const amount = Math.abs(Number(transaction.amount));
      let debitCode: string;
      let creditCode: string;

      if (transaction.type === 'PAYMENT') {
        debitCode = CASH_ACCOUNT_CODE;
        creditCode = AR_ACCOUNT_CODE;
      } else if (transaction.type === 'REFUND') {
        debitCode = AR_ACCOUNT_CODE;
        creditCode = CASH_ACCOUNT_CODE;
      } else if (transaction.type === 'ADJUSTMENT') {
        const positive = Number(transaction.amount) >= 0;
        debitCode = positive ? AR_ACCOUNT_CODE : ADJUSTMENTS_ACCOUNT_CODE;
        creditCode = positive ? ADJUSTMENTS_ACCOUNT_CODE : AR_ACCOUNT_CODE;
      } else {
        debitCode = AR_ACCOUNT_CODE;
        creditCode = CHARGE_CREDIT_ACCOUNT_CODE[transaction.type] as string;
      }

      const debitAccount = getAccount(debitCode);
      const creditAccount = getAccount(creditCode);

      const entry = await this.prisma.journalEntry.create({
        data: {
          propertyId,
          date: transaction.createdAt,
          description: `Folio ${folioId}: ${transaction.description}`,
          lines: {
            create: [
              { accountId: debitAccount.id, debit: amount, credit: 0 },
              { accountId: creditAccount.id, debit: 0, credit: amount },
            ],
          },
        },
      });
      await this.prisma.folioTransaction.update({
        where: { id: transaction.id },
        data: { journalEntryId: entry.id },
      });
      posted.push(transaction.id);
    }

    return { folioId, transactionsPosted: posted.length, alreadyPosted: folio.transactions.length - unposted.length };
  }
}
