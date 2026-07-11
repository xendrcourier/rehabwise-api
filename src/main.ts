import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const configuredOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // no Origin header (curl, server-to-server, mobile apps) - allow
      if (!origin) return callback(null, true);
      // any localhost port - Vite picks a new one whenever the default is busy
      if (/^https?:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      if (configuredOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Not allowed by CORS: ${origin}`), false);
    },
  });
  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
