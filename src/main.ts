import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookies for refresh tokens
  app.use(cookieParser());

  // Global DTO input validation & sanitization
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips properties not declared in the DTO
      forbidNonWhitelisted: true, // Rejects requests with unexpected fields
      transform: true, // Automatically converts incoming payloads to DTO instances
    }),
  );
  app.setGlobalPrefix('api');
  // Enable CORS with credentials for frontend interaction
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3001);
  console.log('Application running on: http://localhost:3001');
}
bootstrap();