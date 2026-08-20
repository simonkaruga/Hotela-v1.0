import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { HousekeepingService } from './housekeeping.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('housekeeping')
export class HousekeepingController {
  constructor(private readonly housekeepingService: HousekeepingService) {}

  @Get('tasks')
  findTasks(@Query('propertyId') propertyId?: string) {
    return this.housekeepingService.findTasks(propertyId);
  }

  @Post('tasks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOUSEKEEPING_SUPERVISOR, UserRole.GENERAL_MANAGER)
  createTask(@Body() dto: CreateTaskDto) {
    return this.housekeepingService.createTask(dto);
  }

  @Post('tasks/:id/start')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOUSEKEEPING_SUPERVISOR, UserRole.GENERAL_MANAGER)
  start(@Param('id') id: string) {
    return this.housekeepingService.start(id);
  }

  @Post('tasks/:id/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOUSEKEEPING_SUPERVISOR, UserRole.GENERAL_MANAGER)
  complete(@Param('id') id: string) {
    return this.housekeepingService.complete(id);
  }

  @Post('tasks/:id/inspect')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HOUSEKEEPING_SUPERVISOR, UserRole.GENERAL_MANAGER)
  inspect(@Param('id') id: string) {
    return this.housekeepingService.inspect(id);
  }
}
