import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { ReportsService } from './reports.service';
import { DailyReportQueryDto } from './dto/daily-report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('daily')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER, UserRole.NIGHT_AUDIT)
  getDaily(@Query() query: DailyReportQueryDto) {
    return this.reportsService.getDailyReport(query.propertyId, query.date);
  }
}
