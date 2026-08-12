import { Module } from '@nestjs/common';
import { FoliosController } from './folios.controller';
import { FoliosService } from './folios.service';
import { LoyaltyModule } from '../loyalty/loyalty.module';

@Module({
  imports: [LoyaltyModule],
  controllers: [FoliosController],
  providers: [FoliosService],
})
export class BillingModule {}
