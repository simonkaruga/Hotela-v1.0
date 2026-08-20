import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MaintenancePriority, MaintenanceStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

const OUT_OF_ORDER_PRIORITIES: MaintenancePriority[] = ['EMERGENCY', 'URGENT'];

@Injectable()
export class MaintenanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async createTicket(dto: CreateTicketDto) {
    const priority = dto.priority ?? 'ROUTINE';
    const ticket = await this.prisma.maintenanceTicket.create({
      data: { ...dto, priority },
      include: { room: true, assignedTo: true },
    });
    if (dto.roomId && OUT_OF_ORDER_PRIORITIES.includes(priority)) {
      await this.prisma.room.update({ where: { id: dto.roomId }, data: { status: 'OUT_OF_ORDER' } });
    }
    if (OUT_OF_ORDER_PRIORITIES.includes(priority)) {
      await this.notifications.notify(
        dto.propertyId,
        'MAINTENANCE',
        `${priority} maintenance ticket: ${dto.description}${ticket.room ? ` (Room ${ticket.room.number})` : ''}`,
      );
    }
    return ticket;
  }

  findTickets(propertyId?: string, status?: MaintenanceStatus) {
    return this.prisma.maintenanceTicket.findMany({
      where: { propertyId, status },
      include: { room: true, assignedTo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async start(id: string) {
    const ticket = await this.getTicket(id);
    if (ticket.status !== 'OPEN') {
      throw new BadRequestException(`Cannot start a ticket with status ${ticket.status}`);
    }
    return this.prisma.maintenanceTicket.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      include: { room: true, assignedTo: true },
    });
  }

  async resolve(id: string) {
    const ticket = await this.getTicket(id);
    if (ticket.status === 'RESOLVED') {
      throw new BadRequestException('Ticket is already resolved');
    }
    if (ticket.roomId) {
      await this.prisma.room.update({ where: { id: ticket.roomId }, data: { status: 'DIRTY' } });
    }
    return this.prisma.maintenanceTicket.update({
      where: { id },
      data: { status: 'RESOLVED', resolvedAt: new Date() },
      include: { room: true, assignedTo: true },
    });
  }

  private async getTicket(id: string) {
    const ticket = await this.prisma.maintenanceTicket.findUnique({ where: { id } });
    if (!ticket) {
      throw new NotFoundException(`Maintenance ticket ${id} not found`);
    }
    return ticket;
  }
}
