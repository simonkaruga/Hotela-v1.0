import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '@prisma/client';

export type JwtPayload = { sub: string; email: string; role: UserRole; propertyId: string };
export type AuthenticatedUser = { id: string; email: string; role: UserRole; propertyId: string };

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev-only-secret-change-me',
    });
  }

  validate(payload: JwtPayload): AuthenticatedUser {
    return { id: payload.sub, email: payload.email, role: payload.role, propertyId: payload.propertyId };
  }
}
