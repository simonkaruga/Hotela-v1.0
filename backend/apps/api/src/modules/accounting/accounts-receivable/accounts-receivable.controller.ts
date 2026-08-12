import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AccountsReceivableService } from './accounts-receivable.service';
import { CreateCorporateAccountDto } from './dto/create-corporate-account.dto';
import { CreateArInvoiceDto } from './dto/create-ar-invoice.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('ar')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccountsReceivableController {
  constructor(private readonly arService: AccountsReceivableService) {}

  @Get('corporate-accounts')
  findCorporateAccounts(@Query('propertyId') propertyId?: string) {
    return this.arService.findCorporateAccounts(propertyId);
  }

  @Post('corporate-accounts')
  @Roles(UserRole.GENERAL_MANAGER)
  createCorporateAccount(@Body() dto: CreateCorporateAccountDto) {
    return this.arService.createCorporateAccount(dto);
  }

  @Get('invoices')
  findInvoices(@Query('corporateAccountId') corporateAccountId?: string) {
    return this.arService.findInvoices(corporateAccountId);
  }

  @Post('invoices')
  @Roles(UserRole.GENERAL_MANAGER, UserRole.NIGHT_AUDIT)
  createInvoice(@Body() dto: CreateArInvoiceDto) {
    return this.arService.createInvoice(dto);
  }

  @Post('invoices/:id/pay')
  @Roles(UserRole.GENERAL_MANAGER, UserRole.NIGHT_AUDIT)
  payInvoice(@Param('id') id: string) {
    return this.arService.payInvoice(id);
  }
}
