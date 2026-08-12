import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { LoyaltyService } from './loyalty.service';
import { RedeemPointsDto } from './dto/redeem-points.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('loyalty')
export class LoyaltyController {
  constructor(private readonly loyaltyService: LoyaltyService) {}

  @Get('guests/:guestId')
  getGuestLoyalty(@Param('guestId') guestId: string) {
    return this.loyaltyService.getGuestLoyalty(guestId);
  }

  @Post('redeem')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.FRONT_DESK, UserRole.GENERAL_MANAGER)
  redeem(@Body() dto: RedeemPointsDto) {
    return this.loyaltyService.redeem(dto);
  }
}
