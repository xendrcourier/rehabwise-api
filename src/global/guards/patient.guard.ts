import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Patient } from '@prisma/client';
import { RequiresPatientVerified } from '../decorators/patient.verified.decorator';

@Injectable()
export class PatientGuard extends AuthGuard('jwt') {
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
    const user = request.user as Patient;

    if (requiresPatientVerified && !user.isEmailVerified) {
      throw new UnauthorizedException('Email verification is required.');
    }

    return true;
  }
}
