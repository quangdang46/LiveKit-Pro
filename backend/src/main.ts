import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { raw } from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.use('/livekit/webhook', raw({ type: 'application/webhook+json' }));
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  );

  const configService = app.get(ConfigService);
  await app.listen(configService.get('APP_PORT') ?? 3000);
}
bootstrap();
