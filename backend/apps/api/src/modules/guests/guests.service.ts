import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';

@Injectable()
export class GuestsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateGuestDto) {
    return this.prisma.guest.create({ data: dto });
  }

  findAll(propertyId?: string, search?: string) {
    return this.prisma.guest.findMany({
      where: {
        propertyId,
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const guest = await this.prisma.guest.findUnique({
      where: { id },
      include: { reservations: { orderBy: { checkIn: 'desc' } } },
    });
    if (!guest) {
      throw new NotFoundException(`Guest ${id} not found`);
    }
    return guest;
  }

  async update(id: string, dto: UpdateGuestDto) {
    await this.findOne(id);
    return this.prisma.guest.update({ where: { id }, data: dto });
  }
}
