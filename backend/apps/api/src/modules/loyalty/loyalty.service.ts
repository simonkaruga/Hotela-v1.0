import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { LoyaltyTier, TransactionType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedeemPointsDto } from './dto/redeem-points.dto';

const POINTS_EARNING_TYPES: TransactionType[] = ['ROOM_CHARGE', 'FNB_CHARGE', 'SPA_CHARGE'];
const POINTS_PER_CURRENCY_UNIT = 100; // 1 point per 100 currency units of eligible charges

function tierForPoints(points: number): LoyaltyTier {
  if (points >= 3000) return 'PLATINUM';
  if (points >= 1500) return 'GOLD';
  if (points >= 500) return 'SILVER';
  return 'BRONZE';
}

@Injectable()
export class LoyaltyService {
  constructor(private readonly prisma: PrismaService) {}

  async getGuestLoyalty(guestId: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id: guestId },
      include: { loyaltyTransactions: { orderBy: { createdAt: 'desc' } } },
    });
    if (!guest) {
      throw new NotFoundException(`Guest ${guestId} not found`);
    }
    return {
      guestId: guest.id,
      points: guest.loyaltyPoints,
      tier: guest.loyaltyTier,
      transactions: guest.loyaltyTransactions,
    };
  }

  async earnFromFolioSettle(folioId: string) {
    const folio = await this.prisma.folio.findUnique({
      where: { id: folioId },
      include: { transactions: true, reservation: true },
    });
    if (!folio) return;

    const eligibleTotal = folio.transactions
      .filter((t) => POINTS_EARNING_TYPES.includes(t.type))
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const pointsEarned = Math.floor(eligibleTotal / POINTS_PER_CURRENCY_UNIT);
    if (pointsEarned <= 0) return;

    const guest = await this.prisma.guest.update({
      where: { id: folio.reservation.guestId },
      data: { loyaltyPoints: { increment: pointsEarned } },
    });
    await this.prisma.guest.update({
      where: { id: guest.id },
      data: { loyaltyTier: tierForPoints(guest.loyaltyPoints) },
    });
    await this.prisma.loyaltyTransaction.create({
      data: {
        guestId: guest.id,
        type: 'EARN',
        points: pointsEarned,
        description: `Earned from folio ${folioId} settlement`,
      },
    });
  }

  async redeem(dto: RedeemPointsDto) {
    const guest = await this.prisma.guest.findUnique({ where: { id: dto.guestId } });
    if (!guest) {
      throw new NotFoundException(`Guest ${dto.guestId} not found`);
    }
    if (guest.loyaltyPoints < dto.points) {
      throw new BadRequestException(`Guest only has ${guest.loyaltyPoints} points, cannot redeem ${dto.points}`);
    }

    const updated = await this.prisma.guest.update({
      where: { id: dto.guestId },
      data: { loyaltyPoints: { decrement: dto.points } },
    });
    await this.prisma.guest.update({
      where: { id: dto.guestId },
      data: { loyaltyTier: tierForPoints(updated.loyaltyPoints) },
    });
    await this.prisma.loyaltyTransaction.create({
      data: { guestId: dto.guestId, type: 'REDEEM', points: dto.points, description: dto.description },
    });

    return this.getGuestLoyalty(dto.guestId);
  }
}
