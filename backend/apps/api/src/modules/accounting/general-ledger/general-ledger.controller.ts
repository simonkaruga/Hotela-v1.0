import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { GeneralLedgerService } from './general-ledger.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('accounting')
export class GeneralLedgerController {
  constructor(private readonly ledgerService: GeneralLedgerService) {}

  @Get('accounts')
  findAccounts(@Query('propertyId') propertyId?: string) {
    return this.ledgerService.findAccounts(propertyId);
  }

  @Post('accounts')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER)
  createAccount(@Body() dto: CreateAccountDto) {
    return this.ledgerService.createAccount(dto);
  }

  @Get('journal-entries')
  findJournalEntries(@Query('propertyId') propertyId?: string) {
    return this.ledgerService.findJournalEntries(propertyId);
  }

  @Post('journal-entries')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER, UserRole.NIGHT_AUDIT)
  createJournalEntry(@Body() dto: CreateJournalEntryDto) {
    return this.ledgerService.createJournalEntry(dto);
  }

  @Get('trial-balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER, UserRole.NIGHT_AUDIT)
  getTrialBalance(@Query('propertyId') propertyId: string) {
    return this.ledgerService.getTrialBalance(propertyId);
  }

  @Post('post-folio/:folioId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.GENERAL_MANAGER, UserRole.NIGHT_AUDIT)
  postFolioToGl(@Param('folioId') folioId: string) {
    return this.ledgerService.postFolioToGl(folioId);
  }
}
