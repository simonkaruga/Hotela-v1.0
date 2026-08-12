import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { GuestsModule } from './modules/guests/guests.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { BillingModule } from './modules/billing/billing.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';
import { PosModule } from './modules/pos/pos.module';
import { SpaModule } from './modules/spa/spa.module';
import { GeneralLedgerModule } from './modules/accounting/general-ledger/general-ledger.module';
import { LoyaltyModule } from './modules/loyalty/loyalty.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { AccountsReceivableModule } from './modules/accounting/accounts-receivable/accounts-receivable.module';
import { HrModule } from './modules/hr/hr.module';
import { EventsModule } from './modules/events/events.module';

@Controller()
class HealthController {
  @Get()
  health() {
    return { status: 'ok', service: 'hotela-api' };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ReservationsModule,
    GuestsModule,
    RoomsModule,
    BillingModule,
    ReportsModule,
    PosModule,
    SpaModule,
    GeneralLedgerModule,
    LoyaltyModule,
    ProcurementModule,
    AccountsReceivableModule,
    HrModule,
    EventsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
