import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsersService } from '../users/users.service';

@Injectable()
export class LastActivityInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap(() => {
        const request = context.switchToHttp().getRequest();
        const user = request.user as { sub: string } | undefined;
        if (user && user.sub) {
          // Update last activity asynchronously (fire and forget)
          this.usersService
            .updateLastActivity(user.sub)
            .catch((err) => console.error('Error updating last activity', err));
        }
      }),
    );
  }
}
