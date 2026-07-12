import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret && process.env.NODE_ENV !== 'test') {
      throw new Error('JWT_SECRET must be configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (request: { headers?: { cookie?: string } } | undefined) => {
          const cookieHeader = request?.headers?.cookie;
          if (!cookieHeader) return null;
          const tokenCookie = cookieHeader
            .split(';')
            .map((part) => part.trim())
            .find((part) => part.startsWith('access_token='));
          return tokenCookie
            ? decodeURIComponent(tokenCookie.split('=').slice(1).join('='))
            : null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: secret || 'test-only-secret',
    });
  }

  validate(payload: any) {
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
