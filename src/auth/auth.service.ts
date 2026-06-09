import { Injectable } from '@nestjs/common';
import { AuthUtilService } from './auth.utils';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { CONFIGS } from 'src/configs';
import { Role } from 'generated/prisma/enums';
import { generateRandomString } from 'src/global/utils/text';
import * as ms from 'ms';

@Injectable()
export class AuthService {
  constructor(
    private readonly authUtil: AuthUtilService,
    private readonly prismaClient: PrismaService,
  ) {}

  // ########### PRIVATE METHODS ###########

  generateAuthTokenPairs(userId: string, role: Role) {
    const __access = this.authUtil.generateJwtToken(
      { type: 'access', userId, role },
      ms(`${CONFIGS.ACCESS_TOKEN_LIFETIME_MINS}m`) / 1000,
    );

    const refreshReference = generateRandomString('alphanumeric', 10);

    const __refresh = this.authUtil.generateJwtToken(
      { type: 'refresh', userId, reference: refreshReference, role },
      ms(`${CONFIGS.REFRESH_TOKEN_LIFETIME_DAYS}d`) / 1000,
    );

    return {
      __access,
      __refresh,
    };
  }

  async onboardUser() {}
}
