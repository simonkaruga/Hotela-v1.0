import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CheckInDto } from './dto/check-in.dto';

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
  checkIn(@Param('id') id: string, @Body() dto: CheckInDto) {
    return this.reservationsService.checkIn(id, dto);
  }

  @Post(':id/check-out')
  checkOut(@Param('id') id: string) {
    return this.reservationsService.checkOut(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.reservationsService.cancel(id);
  }
}
