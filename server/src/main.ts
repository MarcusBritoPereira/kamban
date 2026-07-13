import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const logger = new Logger('Bootstrap');

function toPositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function rateLimitForPath(path: string | undefined) {
  if (path?.startsWith('/v1/auth/login')) {
    return toPositiveInt(process.env.RATE_LIMIT_AUTH_LOGIN_PER_MINUTE, 10);
  }

  if (
    path?.startsWith('/v1/auth/forgot-password') ||
    path?.startsWith('/v1/auth/reset-password')
  ) {
    return toPositiveInt(process.env.RATE_LIMIT_PASSWORD_RESET_PER_MINUTE, 5);
  }

  if (path?.includes('/attachments')) {
    return toPositiveInt(process.env.RATE_LIMIT_UPLOADS_PER_MINUTE, 30);
  }

  if (path?.startsWith('/v1/search')) {
    return toPositiveInt(process.env.RATE_LIMIT_SEARCH_PER_MINUTE, 60);
  }

  if (path?.startsWith('/v1/auth')) {
    return toPositiveInt(process.env.RATE_LIMIT_AUTH_PER_MINUTE, 20);
  }

  return toPositiveInt(process.env.RATE_LIMIT_DEFAULT_PER_MINUTE, 120);
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt <= now) {
        rateLimitStore.delete(key);
      }
    }
  }, 60 * 1000);
  cleanupTimer.unref();

  const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.use((req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()',
    );
    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains',
      );
    }

    const windowMs = 60 * 1000;
    const maxRequests = rateLimitForPath(req.path);
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const current = rateLimitStore.get(key);

    if (!current || current.resetAt <= now) {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > maxRequests) {
      res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
      res.status(429).json({ message: 'Too many requests' });
      return;
    }

    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        logger.warn(`Validation error: ${JSON.stringify(errors)}`);
        return new BadRequestException('Validation Error');
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
// Trigger restart
