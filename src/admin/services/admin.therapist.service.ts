import { BadRequestException, Injectable } from '@nestjs/common';
import * as ms from 'ms';
import { PrismaService } from '../../global/prisma/prisma.service';
import { AuthUtilService } from '../../auth/auth.utils';
import { InviteTherapistDto } from '../../auth/dtos/auth.therapist.dto';
import { ReassignPatientDto } from '../dtos/reassign-patient.dto';
import { Role } from 'generated/prisma/enums';
import { AdminUserService } from './admin.user.service';
import { EmailService } from '../../integrations/notifications/email.service';
import { CONFIGS } from '../../configs';

const userSafeSelect = {
  id: true,
  full_name: true,
  email: true,
  phone: true,
  role: true,
  created_at: true,
  diagnosis: true,
  enrolled_at: true,
  isVerified: true,
  therapist_id: true,
} as const;

@Injectable()
export class AdminTherapistService {
  constructor(
    private readonly prismaClient: PrismaService,
    private readonly authUtil: AuthUtilService,
    private readonly adminUserService: AdminUserService,
    private readonly emailService: EmailService,
  ) {}

  async create(dto: InviteTherapistDto) {
    const { email, full_name, phone } = dto;

    if (
      await this.prismaClient.user.findFirst({
        where: { OR: [{ email }, { phone }] },
      })
    ) {
      throw new BadRequestException(
        'A user with this email or phone number already exists',
      );
    }

    const therapist = await this.prismaClient.user.create({
      data: {
        email,
        full_name,
        phone,
        password: null,
        role: Role.THERAPIST,
      },
      select: userSafeSelect,
    });

    const inviteToken = this.authUtil.generateJwtToken(
      { type: 'invite', userId: therapist.id },
      // @ts-ignore
      ms(`${CONFIGS.INVITE_TOKEN_LIFETIME_DAYS}d`) / 1000,
    );

    const setPasswordUrl = `${CONFIGS.FRONTEND_URL}/therapist/set-password?token=${inviteToken}`;

    await this.emailService.send(
      email,
      'You have been invited to RehabWise',
      `Hi ${full_name},\n\nAn admin has created a therapist account for you on RehabWise. Set your password to activate your account:\n\n${setPasswordUrl}\n\nThis link expires in ${CONFIGS.INVITE_TOKEN_LIFETIME_DAYS} days.`,
    );

    return therapist;
  }

  async findAll() {
    return this.prismaClient.user.findMany({
      where: { role: Role.THERAPIST },
      select: userSafeSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.assertTherapist(id);
  }

  async getPatients(id: string) {
    await this.assertTherapist(id);

    return this.prismaClient.user.findMany({
      where: { therapist_id: id },
      select: userSafeSelect,
      orderBy: { enrolled_at: 'desc' },
    });
  }

  async reassignPatient(patientId: string, dto: ReassignPatientDto) {
    const patient = await this.adminUserService.findOne(patientId);
    if (patient.role !== Role.PATIENT) {
      throw new BadRequestException(`User ${patientId} is not a patient`);
    }

    await this.assertTherapist(dto.therapist_id);

    return this.prismaClient.user.update({
      where: { id: patientId },
      data: { therapist_id: dto.therapist_id },
      select: userSafeSelect,
    });
  }

  async deleteTherapist(id: string) {
    await this.assertTherapist(id);

    const patientCount = await this.prismaClient.user.count({
      where: { therapist_id: id },
    });
    if (patientCount > 0) {
      throw new BadRequestException(
        `Cannot delete — this therapist has ${patientCount} assigned patient(s). Reassign them first.`,
      );
    }

    const alertCount = await this.prismaClient.alert.count({
      where: { therapist_id: id },
    });
    if (alertCount > 0) {
      throw new BadRequestException(
        `Cannot delete — this therapist has ${alertCount} alert(s) on record.`,
      );
    }

    await this.prismaClient.user.delete({ where: { id } });

    return { message: 'Therapist deleted' };
  }

  private async assertTherapist(id: string) {
    const therapist = await this.adminUserService.findOne(id);
    if (therapist.role !== Role.THERAPIST) {
      throw new BadRequestException(`User ${id} is not a therapist`);
    }
    return therapist;
  }
}
