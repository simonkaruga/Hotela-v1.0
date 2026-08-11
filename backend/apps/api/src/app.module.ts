import { Controller, Get, Module } from '@nestjs/common';

@Controller()
class HealthController {
  @Get()
  health() {
    return { status: 'ok', service: 'hotela-api' };
  }
}

@Module({
  controllers: [HealthController],
})
export class AppModule {}
