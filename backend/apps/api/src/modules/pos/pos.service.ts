import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class PosService {
  constructor(private readonly prisma: PrismaService) {}

  createMenuItem(dto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({ data: dto });
  }

  findMenu(propertyId?: string) {
    return this.prisma.menuItem.findMany({
      where: { propertyId, available: true },
      orderBy: { name: 'asc' },
    });
  }

  async createOrder(dto: CreateOrderDto) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id: dto.reservationId } });
    if (!reservation) {
      throw new NotFoundException(`Reservation ${dto.reservationId} not found`);
    }
    if (reservation.status !== 'CHECKED_IN') {
      throw new BadRequestException('Orders can only be charged to a checked-in reservation');
    }

    const menuItemIds = dto.items.map((i) => i.menuItemId);
    const menuItems = await this.prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } });
    const menuItemById = new Map(menuItems.map((m) => [m.id, m]));

    for (const item of dto.items) {
      if (!menuItemById.has(item.menuItemId)) {
        throw new BadRequestException(`Menu item ${item.menuItemId} not found`);
      }
    }

    return this.prisma.order.create({
      data: {
        reservationId: dto.reservationId,
        items: {
          create: dto.items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            unitPrice: menuItemById.get(item.menuItemId)!.price,
          })),
        },
      },
      include: { items: { include: { menuItem: true } }, reservation: { include: { guest: true } } },
    });
  }

  findOrders(reservationId?: string) {
    return this.prisma.order.findMany({
      where: { reservationId },
      include: { items: { include: { menuItem: true } }, reservation: { include: { guest: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async postOrderToFolio(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, reservation: { include: { folio: true } } },
    });
    if (!order) {
      throw new NotFoundException(`Order ${orderId} not found`);
    }
    if (order.status !== 'OPEN') {
      throw new BadRequestException(`Cannot post an order with status ${order.status}`);
    }
    const folio = order.reservation.folio;
    if (!folio) {
      throw new BadRequestException('Reservation has no folio to post to');
    }
    if (folio.status !== 'OPEN') {
      throw new BadRequestException(`Cannot post to a folio with status ${folio.status}`);
    }

    const total = order.items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

    await this.prisma.$transaction([
      this.prisma.folioTransaction.create({
        data: {
          folioId: folio.id,
          type: 'FNB_CHARGE',
          amount: total,
          description: `Restaurant/bar order (${order.items.length} item${order.items.length === 1 ? '' : 's'})`,
        },
      }),
      this.prisma.order.update({ where: { id: orderId }, data: { status: 'POSTED' } }),
    ]);

    return this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { menuItem: true } } },
    });
  }
}
