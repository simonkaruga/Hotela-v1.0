import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class ProcurementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  createSupplier(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({ data: dto });
  }

  findSuppliers(propertyId?: string) {
    return this.prisma.supplier.findMany({ where: { propertyId }, orderBy: { name: 'asc' } });
  }

  createInventoryItem(dto: CreateInventoryItemDto) {
    return this.prisma.inventoryItem.create({
      data: { propertyId: dto.propertyId, name: dto.name, unit: dto.unit, reorderLevel: dto.reorderLevel ?? 0 },
    });
  }

  findInventoryItems(propertyId?: string) {
    return this.prisma.inventoryItem.findMany({ where: { propertyId }, orderBy: { name: 'asc' } });
  }

  createPurchaseOrder(dto: CreatePurchaseOrderDto) {
    return this.prisma.purchaseOrder.create({
      data: {
        propertyId: dto.propertyId,
        supplierId: dto.supplierId,
        items: { create: dto.items },
      },
      include: { items: { include: { inventoryItem: true } }, supplier: true },
    });
  }

  findPurchaseOrders(propertyId?: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { propertyId },
      include: { items: { include: { inventoryItem: true } }, supplier: true, supplierInvoice: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markOrdered(id: string) {
    const po = await this.getPurchaseOrder(id);
    if (po.status !== 'DRAFT') {
      throw new BadRequestException(`Cannot mark ordered a purchase order with status ${po.status}`);
    }
    return this.prisma.purchaseOrder.update({ where: { id }, data: { status: 'ORDERED' } });
  }

  async receive(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id }, include: { items: true } });
    if (!po) {
      throw new NotFoundException(`Purchase order ${id} not found`);
    }
    if (po.status !== 'ORDERED') {
      throw new BadRequestException(`Cannot receive a purchase order with status ${po.status}`);
    }

    const total = po.items.reduce((sum, item) => sum + Number(item.unitCost) * Number(item.quantity), 0);

    await this.prisma.$transaction([
      ...po.items.map((item) =>
        this.prisma.inventoryItem.update({
          where: { id: item.inventoryItemId },
          data: { quantityOnHand: { increment: item.quantity } },
        }),
      ),
      this.prisma.purchaseOrder.update({ where: { id }, data: { status: 'RECEIVED' } }),
      this.prisma.supplierInvoice.create({
        data: {
          supplierId: po.supplierId,
          purchaseOrderId: po.id,
          amount: total,
          dueDate: new Date(Date.now() + THIRTY_DAYS_MS),
        },
      }),
    ]);

    for (const item of po.items) {
      const updated = await this.prisma.inventoryItem.findUnique({ where: { id: item.inventoryItemId } });
      if (updated && Number(updated.quantityOnHand) < Number(updated.reorderLevel)) {
        await this.notifications.notify(
          po.propertyId,
          'LOW_STOCK',
          `${updated.name} is still below reorder level (${updated.quantityOnHand} ${updated.unit} on hand, reorder at ${updated.reorderLevel})`,
        );
      }
    }

    return this.prisma.purchaseOrder.findUnique({
      where: { id },
      include: { items: { include: { inventoryItem: true } }, supplierInvoice: true },
    });
  }

  findSupplierInvoices(propertyId?: string) {
    return this.prisma.supplierInvoice.findMany({
      where: propertyId ? { supplier: { propertyId } } : {},
      include: { supplier: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async paySupplierInvoice(id: string) {
    const invoice = await this.prisma.supplierInvoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException(`Supplier invoice ${id} not found`);
    }
    if (invoice.status !== 'UNPAID') {
      throw new BadRequestException(`Cannot pay a supplier invoice with status ${invoice.status}`);
    }
    return this.prisma.supplierInvoice.update({ where: { id }, data: { status: 'PAID' } });
  }

  private async getPurchaseOrder(id: string) {
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) {
      throw new NotFoundException(`Purchase order ${id} not found`);
    }
    return po;
  }
}
