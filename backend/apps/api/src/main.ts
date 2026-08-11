import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000').split(',');
  app.enableCors({ origin: allowedOrigins });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`Hotela API listening on http://localhost:${port}`);
}

bootstrap();
