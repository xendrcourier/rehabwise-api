import { Reflector } from '@nestjs/core';

export const RequiresPatientVerified = Reflector.createDecorator<boolean>();
