import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ReservationStatus, UserRole } from '@prisma/client';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckInDto } from './dto/check-in.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

const FRONT_DESK_ROLES = [UserRole.FRONT_DESK, UserRole.GENERAL_MANAGER];

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  create(@Body() dto: CreateReservationDto) {
    return this.reservationsService.create(dto);
  }

  @Get()
  findAll(@Query('propertyId') propertyId?: string, @Query('status') status?: ReservationStatus) {
    return this.reservationsService.findAll(propertyId, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservationsService.findOne(id);
  }

  @Post(':id/check-in')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...FRONT_DESK_ROLES)
  checkIn(@Param('id') id: string, @Body() dto: CheckInDto) {
    return this.reservationsService.checkIn(id, dto);
  }

  @Post(':id/check-out')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...FRONT_DESK_ROLES)
  checkOut(@Param('id') id: string) {
    return this.reservationsService.checkOut(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(...FRONT_DESK_ROLES)
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancel(id);
  }
}
