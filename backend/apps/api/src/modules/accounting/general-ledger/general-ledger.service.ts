import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';

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
}
