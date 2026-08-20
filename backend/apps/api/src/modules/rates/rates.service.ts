import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRatePlanDto } from './dto/create-rate-plan.dto';

@Injectable()
export class RatesService {
  constructor(private readonly prisma: PrismaService) {}

  async createRatePlan(dto: CreateRatePlanDto) {
    const roomType = await this.prisma.roomType.findUnique({ where: { id: dto.roomTypeId } });
    if (!roomType) {
      throw new NotFoundException(`Room type ${dto.roomTypeId} not found`);
    }
    return this.withEffectiveRate(
      await this.prisma.ratePlan.create({ data: dto, include: { roomType: true } }),
    );
  }

  async findRatePlans(propertyId?: string) {
    const plans = await this.prisma.ratePlan.findMany({
      where: propertyId ? { roomType: { propertyId } } : {},
      include: { roomType: true },
      orderBy: { createdAt: 'desc' },
    });
    return plans.map((p) => this.withEffectiveRate(p));
  }

  async deactivate(id: string) {
    const plan = await this.prisma.ratePlan.findUnique({ where: { id } });
    if (!plan) {
      throw new NotFoundException(`Rate plan ${id} not found`);
    }
    return this.withEffectiveRate(
      await this.prisma.ratePlan.update({ where: { id }, data: { active: false }, include: { roomType: true } }),
    );
  }

  private withEffectiveRate<T extends { adjustmentPct: unknown; roomType: { baseRate: unknown } }>(plan: T) {
    const base = Number(plan.roomType.baseRate);
    const pct = Number(plan.adjustmentPct);
    const effectiveRate = Math.round(base * (1 + pct / 100) * 100) / 100;
    return { ...plan, effectiveRate };
  }
}
