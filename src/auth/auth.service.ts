import { Injectable } from '@nestjs/common';
import { AuthUtilService } from './auth.utils';
import { PrismaService } from 'src/global/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authUtilService: AuthUtilService,
    private readonly prismaClient: PrismaService,
  ) {}
}
