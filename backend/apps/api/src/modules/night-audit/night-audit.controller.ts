import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { NightAuditService } from './night-audit.service';
import { RunNightAuditDto } from './dto/run-night-audit.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('night-audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NightAuditController {
  constructor(private readonly nightAuditService: NightAuditService) {}

  @Post('run')
  @Roles(UserRole.GENERAL_MANAGER, UserRole.NIGHT_AUDIT)
  run(@Body() dto: RunNightAuditDto) {
    return this.nightAuditService.run(dto);
  }
}
