import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { EventsService } from './events.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { CreateRoomBlockDto } from './dto/create-room-block.dto';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('inquiries')
  createInquiry(@Body() dto: CreateInquiryDto) {
    return this.eventsService.createInquiry(dto);
  }

  @Get('inquiries')
  findInquiries(@Query('propertyId') propertyId?: string) {
    return this.eventsService.findInquiries(propertyId);
  }

  @Get('inquiries/:id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post('inquiries/:id/room-block')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER)
  holdRoomBlock(@Param('id') id: string, @Body() dto: CreateRoomBlockDto) {
    return this.eventsService.holdRoomBlock(id, dto);
  }

  @Post('inquiries/:id/quote')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER)
  recordQuote(@Param('id') id: string, @Body() dto: CreateQuoteDto) {
    return this.eventsService.recordQuote(id, dto);
  }

  @Post('inquiries/:id/deposit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER)
  recordDeposit(@Param('id') id: string) {
    return this.eventsService.recordDeposit(id);
  }

  @Post('inquiries/:id/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER)
  cancel(@Param('id') id: string) {
    return this.eventsService.cancel(id);
  }
}
