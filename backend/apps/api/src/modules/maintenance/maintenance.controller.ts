import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { MaintenanceStatus, UserRole } from '@prisma/client';
import { MaintenanceService } from './maintenance.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('tickets')
  findTickets(@Query('propertyId') propertyId?: string, @Query('status') status?: MaintenanceStatus) {
    return this.maintenanceService.findTickets(propertyId, status);
  }

  @Post('tickets')
  createTicket(@Body() dto: CreateTicketDto) {
    return this.maintenanceService.createTicket(dto);
  }

  @Post('tickets/:id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER, UserRole.HOUSEKEEPING_SUPERVISOR)
  start(@Param('id') id: string) {
    return this.maintenanceService.start(id);
  }

  @Post('tickets/:id/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER, UserRole.HOUSEKEEPING_SUPERVISOR)
  resolve(@Param('id') id: string) {
    return this.maintenanceService.resolve(id);
  }
}
