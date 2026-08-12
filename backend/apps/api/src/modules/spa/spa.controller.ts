import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { SpaService } from './spa.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('spa')
export class SpaController {
  constructor(private readonly spaService: SpaService) {}

  @Get('treatments')
  findTreatments(@Query('propertyId') propertyId?: string) {
    return this.spaService.findTreatments(propertyId);
  }

  @Post('treatments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER)
  createTreatment(@Body() dto: CreateTreatmentDto) {
    return this.spaService.createTreatment(dto);
  }

  @Get('appointments')
  findAppointments(@Query('reservationId') reservationId?: string) {
    return this.spaService.findAppointments(reservationId);
  }

  @Post('appointments')
  createAppointment(@Body() dto: CreateAppointmentDto) {
    return this.spaService.createAppointment(dto);
  }

  @Post('appointments/:id/cancel')
  cancel(@Param('id') id: string) {
    return this.spaService.cancel(id);
  }

  @Post('appointments/:id/post-to-folio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FRONT_DESK, UserRole.GENERAL_MANAGER)
  postToFolio(@Param('id') id: string) {
    return this.spaService.postToFolio(id);
  }
}
