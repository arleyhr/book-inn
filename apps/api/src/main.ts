/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import * as fs from 'fs';
import { join } from 'path';

async function bootstrap() {
  const uploadsPath = join(process.cwd(), 'uploads');
  const hotelsPath = join(uploadsPath, 'hotels');

  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
  }
  if (!fs.existsSync(hotelsPath)) {
    fs.mkdirSync(hotelsPath, { recursive: true });
  }

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 8080;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
