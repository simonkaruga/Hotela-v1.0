import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findForProperty(@Query('propertyId') propertyId: string, @Query('unread') unread?: string) {
    return this.notificationsService.findForProperty(propertyId, unread === 'true');
  }

  @Post(':id/read')
  markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }

  @Post('read-all')
  markAllRead(@Query('propertyId') propertyId: string) {
    return this.notificationsService.markAllRead(propertyId);
  }
}
