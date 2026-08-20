import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../common/prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';

const SKIP_PREFIXES = ['/audit-log', '/auth/login'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const method = request.method;
    const path = request.originalUrl ?? request.url;

    if (method === 'GET' || SKIP_PREFIXES.some((prefix) => path.startsWith(prefix))) {
      return next.handle();
    }

    return next.handle().pipe(
      tap({
        next: () => this.log(request, response.statusCode ?? 200, path, method),
        error: (err) => this.log(request, err?.status ?? 500, path, method),
      }),
    );
  }

  private log(request: { user?: AuthenticatedUser }, statusCode: number, path: string, method: string) {
    this.prisma.auditLog
      .create({
        data: {
          userEmail: request.user?.email,
          role: request.user?.role,
          method,
          path,
          statusCode,
        },
      })
      .catch(() => undefined);
  }
}
