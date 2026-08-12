import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateCorporateAccountDto } from './dto/create-corporate-account.dto';
import { CreateArInvoiceDto } from './dto/create-ar-invoice.dto';

@Injectable()
export class AccountsReceivableService {
  constructor(private readonly prisma: PrismaService) {}

  createCorporateAccount(dto: CreateCorporateAccountDto) {
    return this.prisma.corporateAccount.create({ data: dto });
  }

  async findCorporateAccounts(propertyId?: string) {
    const accounts = await this.prisma.corporateAccount.findMany({
      where: { propertyId },
      include: { invoices: true },
      orderBy: { name: 'asc' },
    });
    return accounts.map((a) => ({
      ...a,
      outstandingBalance: a.invoices
        .filter((i) => i.status === 'UNPAID')
        .reduce((sum, i) => sum + Number(i.amount), 0),
    }));
  }

  async createInvoice(dto: CreateArInvoiceDto) {
    const account = await this.prisma.corporateAccount.findUnique({
      where: { id: dto.corporateAccountId },
      include: { invoices: true },
    });
    if (!account) {
      throw new NotFoundException(`Corporate account ${dto.corporateAccountId} not found`);
    }

    const outstanding = account.invoices
      .filter((i) => i.status === 'UNPAID')
      .reduce((sum, i) => sum + Number(i.amount), 0);
    if (outstanding + dto.amount > Number(account.creditLimit)) {
      throw new BadRequestException(
        `Invoice would exceed credit limit: outstanding ${outstanding} + ${dto.amount} > limit ${account.creditLimit}`,
      );
    }

    return this.prisma.arInvoice.create({
      data: {
        corporateAccountId: dto.corporateAccountId,
        amount: dto.amount,
        description: dto.description,
        dueDate: new Date(dto.dueDate),
      },
    });
  }

  findInvoices(corporateAccountId?: string) {
    return this.prisma.arInvoice.findMany({
      where: { corporateAccountId },
      include: { corporateAccount: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async payInvoice(id: string) {
    const invoice = await this.prisma.arInvoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`AR invoice ${id} not found`);
    }
    if (invoice.status !== 'UNPAID') {
      throw new BadRequestException(`Cannot pay an AR invoice with status ${invoice.status}`);
    }
    return this.prisma.arInvoice.update({ where: { id }, data: { status: 'PAID' } });
  }
}
