import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from 'generated/prisma/client';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class AdminGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isActive = (await super.canActivate(context)) as boolean;
    if (!isActive) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (user.role !== Role.ADMIN) {
      throw new UnauthorizedException('This route is admin-only.');
    }

    return true;
  }
}
