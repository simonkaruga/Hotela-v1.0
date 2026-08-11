import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(propertyId?: string) {
    return this.prisma.room.findMany({
      where: { propertyId },
      include: {
        roomType: true,
        reservations: {
          where: { status: 'CHECKED_IN' },
          include: { guest: true },
        },
      },
      orderBy: { number: 'asc' },
    });
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        roomType: true,
        reservations: {
          where: { status: { in: ['CHECKED_IN', 'CONFIRMED'] } },
          include: { guest: true },
          orderBy: { checkIn: 'asc' },
        },
      },
    });
    if (!room) {
      throw new NotFoundException(`Room ${id} not found`);
    }
    return room;
  }
}
