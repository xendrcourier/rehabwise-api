import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthUtilService } from './auth.utils';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { CONFIGS } from 'src/configs';
import { Role } from 'generated/prisma/enums';
import { generateRandomString } from 'src/global/utils/text';
import * as ms from 'ms';
import { OnboardTherapistDto } from './dtos/auth.therapist.dto';
import { OnboardPatientDto } from './dtos/auth.patient.dto';
import { AuthRefreshDto } from './dtos/auth.refresh.dto';
import { AuthLoginDto } from './dtos/auth.login.dto';

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

  private async _blacklistRefreshToken(reference: string) {
    await this.prismaClient.refreshTokenBlacklist.create({
      data: {
        reference: reference,
        expiresAt: new Date(
          Date.now() + ms(`${CONFIGS.REFRESH_TOKEN_LIFETIME_DAYS}d`),
        ),
      },
    });
  }

  private async _validateRefresh(refreshToken: string) {
    // 1. validate token
    const payload = (await this.authUtil.verifyToken(refreshToken)) as {
      type: string;
      reference: string;
      userId: string;
      role: Role;
    };
    if (payload.type !== 'refresh')
      throw new BadRequestException('Invalid refresh token');

    if (!payload.reference)
      throw new BadRequestException('Invalid refresh token, missing reference');

    // 2. validate if blacklisted
    const refreshTokenBlackList =
      await this.prismaClient.refreshTokenBlacklist.findUnique({
        where: { reference: payload.reference },
      });

    if (refreshTokenBlackList)
      throw new BadRequestException(
        'Refresh token invalid, already blacklisted',
      );

    // 3. confirm the account behind the token still exists, so a deleted
    // account can't keep refreshing tokens off a token issued while it existed
    const user = await this.prismaClient.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || user.role !== payload.role)
      throw new BadRequestException('Invalid refresh token');

    return payload;
  }

  async onboardUser(data: OnboardPatientDto) {
    const { email, full_name, phone, password, diagnosis, therapist_id } =
      data;

    if (
      await this.prismaClient.user.findFirst({
        where: {
          OR: [{ email }, { phone }],
        },
      })
    ) {
      throw new BadRequestException(
        'A user with this email or phone number already exists',
      );
    }

    const therapist = await this.prismaClient.user.findUnique({
      where: { id: therapist_id },
    });

    if (!therapist || therapist.role !== Role.THERAPIST) {
      throw new BadRequestException('Invalid therapist_id');
    }

    const hashedPassword = await this.authUtil.hashPassword(password);

    const patient = await this.prismaClient.user.create({
      data: {
        email,
        full_name,
        phone,
        password: hashedPassword,
        diagnosis,
        therapist_id,
        role: Role.PATIENT,
      },
    });

    const { __access, __refresh } = await this.generateAuthTokenPairs(
      patient.id,
      Role.PATIENT,
    );

    return { __access, __refresh };
  }

  async onboardTherapist(data: OnboardTherapistDto) {
    const { email, full_name, phone, password } = data;

    if (
      await this.prismaClient.user.findFirst({
        where: {
          OR: [{ email }, { phone }],
        },
      })
    ) {
      throw new BadRequestException(
        'A user with this email or phone number already exists',
      );
    }

    const hashedPassword = await this.authUtil.hashPassword(password);

    const therapist = await this.prismaClient.user.create({
      data: {
        email,
        full_name,
        phone,
        password: hashedPassword,
        role: Role.THERAPIST,
      },
    });

    const { __access, __refresh } = await this.generateAuthTokenPairs(
      therapist.id,
      Role.THERAPIST,
    );

    return { __access, __refresh };
  }

  async login(data: AuthLoginDto, role: Role) {
    const { email, phone, password } = data;

    const user = await this.prismaClient.user.findFirst({
      where: {
        role,
        OR: [{ email }, { phone }],
      },
    });

    if (!user) {
      // run a dummy bcrypt compare so this path costs the same as the
      // wrong-password path below, and doesn't leak account existence via timing
      await this.authUtil.verifyPasswordTimingSafeNoOp(password);
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await this.authUtil.verifyPassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Invalid credentials');
    }
    await this.prismaClient.authSession.create({
      data: {
        user_id: user.id,
        last_accessed: new Date(),
      },
    });
    const { __access, __refresh } = await this.generateAuthTokenPairs(
      user.id,
      role,
    );

    return { __access, __refresh };
  }

  async logout(input: AuthRefreshDto) {
    const payload = await this._validateRefresh(input.refreshToken);

    // 1. blacklist refresh token
    await this._blacklistRefreshToken(payload.reference);

    return {
      message: 'Logout successful',
    };
  }

  async refresh(input: AuthRefreshDto) {
    const payload = await this._validateRefresh(input.refreshToken);

    // 1. blacklist refresh token
    await this._blacklistRefreshToken(payload.reference);

    // 2. generate new token pairs
    const tokens = this.generateAuthTokenPairs(payload.userId, payload.role);

    return tokens;
  }
}
