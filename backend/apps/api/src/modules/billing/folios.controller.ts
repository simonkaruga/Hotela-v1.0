import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { FoliosService } from './folios.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('folios')
export class FoliosController {
  constructor(private readonly foliosService: FoliosService) {}

  @Get()
  findAll(@Query('propertyId') propertyId?: string) {
    return this.foliosService.findAll(propertyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foliosService.findOne(id);
  }

  @Post(':id/transactions')
  postTransaction(@Param('id') id: string, @Body() dto: CreateTransactionDto) {
    return this.foliosService.postTransaction(id, dto);
  }

  @Post(':id/settle')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER, UserRole.NIGHT_AUDIT)
  settle(@Param('id') id: string) {
    return this.foliosService.settle(id);
  }
}
