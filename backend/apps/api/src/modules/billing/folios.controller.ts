import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { FoliosService } from './folios.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

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
  settle(@Param('id') id: string) {
    return this.foliosService.settle(id);
  }
}
