import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

/**
 * Configura Nest de forma idéntica para el servidor local y la función de
 * Vercel. Mantener esta configuración aquí evita que el handler serverless
 * abra un puerto o se inicialice más de una vez por solicitud.
 */
export async function createApp() {
  const app = await NestFactory.create(AppModule);
  const configuredOrigins = process.env.CORS_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    // En producción el origen debe declararse explícitamente en Vercel.
    origin:
      configuredOrigins && configuredOrigins.length > 0
        ? configuredOrigins
        : process.env.NODE_ENV === 'production'
          ? false
          : true,
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api/v1');

  return app;
}
