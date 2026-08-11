import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PosService } from './pos.service';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('pos')
export class PosController {
  constructor(private readonly posService: PosService) {}

  @Get('menu')
  findMenu(@Query('propertyId') propertyId?: string) {
    return this.posService.findMenu(propertyId);
  }

  @Post('menu')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER)
  createMenuItem(@Body() dto: CreateMenuItemDto) {
    return this.posService.createMenuItem(dto);
  }

  @Get('orders')
  findOrders(@Query('reservationId') reservationId?: string) {
    return this.posService.findOrders(reservationId);
  }

  @Post('orders')
  createOrder(@Body() dto: CreateOrderDto) {
    return this.posService.createOrder(dto);
  }

  @Post('orders/:id/post-to-folio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FRONT_DESK, UserRole.GENERAL_MANAGER)
  postToFolio(@Param('id') id: string) {
    return this.posService.postOrderToFolio(id);
  }
}
