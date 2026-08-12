import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { HrService } from './hr.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateShiftDto } from './dto/create-shift.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('hr')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HrController {
  constructor(private readonly hrService: HrService) {}

  @Get('employees')
  findEmployees(@Query('propertyId') propertyId?: string) {
    return this.hrService.findEmployees(propertyId);
  }

  @Post('employees')
  @Roles(UserRole.GENERAL_MANAGER)
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrService.createEmployee(dto);
  }

  @Get('shifts')
  findShifts(@Query('date') date?: string) {
    return this.hrService.findShifts(date);
  }

  @Post('shifts')
  @Roles(UserRole.GENERAL_MANAGER)
  createShift(@Body() dto: CreateShiftDto) {
    return this.hrService.createShift(dto);
  }
}
