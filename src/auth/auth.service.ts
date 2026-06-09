import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthUtilService } from './auth.utils';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { CONFIGS } from 'src/configs';
import { Role } from 'generated/prisma/enums';
import { generateRandomString } from 'src/global/utils/text';
import * as ms from 'ms';
import { OnboardTherapistDto } from './dtos/auth.therapist.dto';
import { OnboardPatientDto } from './dtos/auth.patient.dto';

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

  async onboardUser(data: OnboardPatientDto) {
    const { email, full_name, phone, password, diagnosis } = data;

    if (
      await this.prismaClient.patient.findFirst({
        where: {
          OR: [{ email }, { phone }],
        },
      })
    ) {
      throw new BadRequestException(
        'Patient with this email or phone number already exists',
      );
    }

    const hashedPassword = await this.authUtil.hashPassword(password);

    const patient = await this.prismaClient.patient.create({
      data: {
        email,
        full_name,
        phone,
        password: hashedPassword,
        diagnosis,
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
      await this.prismaClient.therapist.findFirst({
        where: {
          OR: [{ email }, { phone }],
        },
      })
    ) {
      throw new BadRequestException(
        'Therapist with this email or phone number already exists',
      );
    }

    const hashedPassword = await this.authUtil.hashPassword(password);

    const therapist = await this.prismaClient.therapist.create({
      data: {
        email,
        full_name,
        phone,
        password: hashedPassword,
      },
    });

    const { __access, __refresh } = await this.generateAuthTokenPairs(
      therapist.id,
      Role.THERAPIST,
    );

    return { __access, __refresh };
  }
}
