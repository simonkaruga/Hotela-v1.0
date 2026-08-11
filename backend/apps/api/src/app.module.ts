import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { GuestsModule } from './modules/guests/guests.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { BillingModule } from './modules/billing/billing.module';
import { AuthModule } from './modules/auth/auth.module';
import { ReportsModule } from './modules/reports/reports.module';

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
  ],
  controllers: [HealthController],
})
export class AppModule {}
