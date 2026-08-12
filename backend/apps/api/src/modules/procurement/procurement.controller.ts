import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ProcurementService } from './procurement.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { CreatePurchaseOrderDto } from './dto/create-purchase-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('procurement')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProcurementController {
  constructor(private readonly procurementService: ProcurementService) {}

  @Get('suppliers')
  findSuppliers(@Query('propertyId') propertyId?: string) {
    return this.procurementService.findSuppliers(propertyId);
  }

  @Post('suppliers')
  @Roles(UserRole.GENERAL_MANAGER)
  createSupplier(@Body() dto: CreateSupplierDto) {
    return this.procurementService.createSupplier(dto);
  }

  @Get('inventory-items')
  findInventoryItems(@Query('propertyId') propertyId?: string) {
    return this.procurementService.findInventoryItems(propertyId);
  }

  @Post('inventory-items')
  @Roles(UserRole.GENERAL_MANAGER)
  createInventoryItem(@Body() dto: CreateInventoryItemDto) {
    return this.procurementService.createInventoryItem(dto);
  }

  @Get('purchase-orders')
  findPurchaseOrders(@Query('propertyId') propertyId?: string) {
    return this.procurementService.findPurchaseOrders(propertyId);
  }

  @Post('purchase-orders')
  @Roles(UserRole.GENERAL_MANAGER)
  createPurchaseOrder(@Body() dto: CreatePurchaseOrderDto) {
    return this.procurementService.createPurchaseOrder(dto);
  }

  @Post('purchase-orders/:id/mark-ordered')
  @Roles(UserRole.GENERAL_MANAGER)
  markOrdered(@Param('id') id: string) {
    return this.procurementService.markOrdered(id);
  }

  @Post('purchase-orders/:id/receive')
  @Roles(UserRole.GENERAL_MANAGER)
  receive(@Param('id') id: string) {
    return this.procurementService.receive(id);
  }

  @Get('supplier-invoices')
  findSupplierInvoices(@Query('propertyId') propertyId?: string) {
    return this.procurementService.findSupplierInvoices(propertyId);
  }

  @Post('supplier-invoices/:id/pay')
  @Roles(UserRole.GENERAL_MANAGER)
  paySupplierInvoice(@Param('id') id: string) {
    return this.procurementService.paySupplierInvoice(id);
  }
}
