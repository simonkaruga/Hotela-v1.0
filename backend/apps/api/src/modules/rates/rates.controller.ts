import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { RatesService } from './rates.service';
import { CreateRatePlanDto } from './dto/create-rate-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('rates')
export class RatesController {
  constructor(private readonly ratesService: RatesService) {}

  @Get('plans')
  findRatePlans(@Query('propertyId') propertyId?: string) {
    return this.ratesService.findRatePlans(propertyId);
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER)
  createRatePlan(@Body() dto: CreateRatePlanDto) {
    return this.ratesService.createRatePlan(dto);
  }

  @Post('plans/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER)
  deactivate(@Param('id') id: string) {
    return this.ratesService.deactivate(id);
  }
}
