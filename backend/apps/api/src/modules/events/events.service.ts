import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { CreateRoomBlockDto } from './dto/create-room-block.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';

@Injectable()
export class EventsService {
  constructor(private readonly prisma: PrismaService) {}

  createInquiry(dto: CreateInquiryDto) {
    return this.prisma.eventInquiry.create({
      data: { ...dto, eventDate: new Date(dto.eventDate) },
    });
  }

  findInquiries(propertyId?: string) {
    return this.prisma.eventInquiry.findMany({
      where: { propertyId },
      include: { roomBlock: true, quote: true },
      orderBy: { eventDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const inquiry = await this.prisma.eventInquiry.findUnique({
      where: { id },
      include: { roomBlock: true, quote: true },
    });
    if (!inquiry) {
      throw new NotFoundException(`Event inquiry ${id} not found`);
    }
    return inquiry;
  }

  async holdRoomBlock(inquiryId: string, dto: CreateRoomBlockDto) {
    const inquiry = await this.findOne(inquiryId);
    if (inquiry.roomBlock) {
      throw new BadRequestException('This inquiry already has a room block on hold');
    }
    if (inquiry.status === 'CANCELLED') {
      throw new BadRequestException('Cannot hold a room block for a cancelled inquiry');
    }
    return this.prisma.roomBlock.create({
      data: {
        eventInquiryId: inquiryId,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        roomsBlocked: dto.roomsBlocked,
        notes: dto.notes,
      },
    });
  }

  async recordQuote(inquiryId: string, dto: CreateQuoteDto) {
    const inquiry = await this.findOne(inquiryId);
    if (inquiry.status !== 'INQUIRY') {
      throw new BadRequestException(`Cannot record a quote for an inquiry with status ${inquiry.status}`);
    }
    if (inquiry.quote) {
      throw new BadRequestException('This inquiry already has a quote');
    }

    await this.prisma.$transaction([
      this.prisma.eventQuote.create({
        data: { eventInquiryId: inquiryId, amount: dto.amount, depositAmount: dto.depositAmount },
      }),
      this.prisma.eventInquiry.update({ where: { id: inquiryId }, data: { status: 'QUOTED' } }),
    ]);
    return this.findOne(inquiryId);
  }

  async recordDeposit(inquiryId: string) {
    const inquiry = await this.findOne(inquiryId);
    if (inquiry.status !== 'QUOTED' || !inquiry.quote) {
      throw new BadRequestException(`Cannot record a deposit for an inquiry with status ${inquiry.status}`);
    }
    await this.prisma.$transaction([
      this.prisma.eventQuote.update({ where: { eventInquiryId: inquiryId }, data: { depositPaid: true } }),
      this.prisma.eventInquiry.update({ where: { id: inquiryId }, data: { status: 'CONFIRMED' } }),
    ]);
    return this.findOne(inquiryId);
  }

  async cancel(inquiryId: string) {
    const inquiry = await this.findOne(inquiryId);
    if (inquiry.status === 'CANCELLED' || inquiry.status === 'CONFIRMED') {
      throw new BadRequestException(`Cannot cancel an inquiry with status ${inquiry.status}`);
    }
    return this.prisma.eventInquiry.update({ where: { id: inquiryId }, data: { status: 'CANCELLED' } });
  }
}
