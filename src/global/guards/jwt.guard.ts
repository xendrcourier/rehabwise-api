import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { User } from 'generated/prisma/client';
import { Role } from 'generated/prisma/enums';
import { RequiresPatientVerified } from '../decorators/patient.verified.decorator';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  constructor(protected reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresPatientVerified =
      this.reflector.getAllAndOverride<boolean>(RequiresPatientVerified, [
        context.getHandler(),
        context.getClass(),
      ]) ?? false;

    const isActive = (await super.canActivate(context)) as boolean;
    if (!isActive) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (user.role !== Role.PATIENT) {
      throw new UnauthorizedException('This route is patient-only.');
    }

    if (requiresPatientVerified && !user.isVerified) {
      throw new UnauthorizedException('Email verification is required.');
    }

    return true;
  }
}
