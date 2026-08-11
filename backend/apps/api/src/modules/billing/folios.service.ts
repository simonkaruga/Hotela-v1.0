import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FolioTransaction, TransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const DEBIT_TYPES: TransactionType[] = ['ROOM_CHARGE', 'TAX'];
const CREDIT_TYPES: TransactionType[] = ['PAYMENT', 'REFUND'];

function computeBalance(transactions: FolioTransaction[]): number {
  return transactions.reduce((sum, t) => {
    const amount = Number(t.amount);
    if (DEBIT_TYPES.includes(t.type)) return sum + amount;
    if (CREDIT_TYPES.includes(t.type)) return sum - amount;
    return sum + amount; // ADJUSTMENT: signed as entered
  }, 0);
}

@Injectable()
export class FoliosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(propertyId?: string) {
    return this.prisma.folio
      .findMany({
        where: propertyId ? { reservation: { propertyId } } : {},
        include: { transactions: true, reservation: { include: { guest: true, room: true } } },
        orderBy: { createdAt: 'desc' },
      })
      .then((folios) => folios.map((f) => ({ ...f, balance: computeBalance(f.transactions) })));
  }

  async findOne(id: string) {
    const folio = await this.prisma.folio.findUnique({
      where: { id },
      include: { transactions: { orderBy: { createdAt: 'asc' } }, reservation: { include: { guest: true, room: true } } },
    });
    if (!folio) {
      throw new NotFoundException(`Folio ${id} not found`);
    }
    return { ...folio, balance: computeBalance(folio.transactions) };
  }

  async postTransaction(folioId: string, dto: CreateTransactionDto) {
    const folio = await this.prisma.folio.findUnique({ where: { id: folioId } });
    if (!folio) {
      throw new NotFoundException(`Folio ${folioId} not found`);
    }
    if (folio.status !== 'OPEN') {
      throw new BadRequestException(`Cannot post to a folio with status ${folio.status}`);
    }
    if (dto.type !== 'ADJUSTMENT' && dto.amount <= 0) {
      throw new BadRequestException(`${dto.type} amount must be positive`);
    }
    if (dto.amount === 0) {
      throw new BadRequestException('amount cannot be zero');
    }

    await this.prisma.folioTransaction.create({
      data: { folioId, type: dto.type, amount: dto.amount, description: dto.description },
    });
    return this.findOne(folioId);
  }

  async settle(folioId: string) {
    const folio = await this.findOne(folioId);
    if (folio.status !== 'OPEN') {
      throw new BadRequestException(`Cannot settle a folio with status ${folio.status}`);
    }
    if (Math.round(folio.balance * 100) !== 0) {
      throw new BadRequestException(`Cannot settle a folio with a non-zero balance (${folio.balance})`);
    }
    return this.prisma.folio.update({
      where: { id: folioId },
      data: { status: 'SETTLED' },
      include: { transactions: true },
    });
  }
}
