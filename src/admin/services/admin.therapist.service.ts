import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../global/prisma/prisma.service';
import { AuthUtilService } from '../../auth/auth.utils';
import { OnboardTherapistDto } from '../../auth/dtos/auth.therapist.dto';
import { ReassignPatientDto } from '../dtos/reassign-patient.dto';
import { Role } from 'generated/prisma/enums';
import { AdminUserService } from './admin.user.service';

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
  ) {}

  async create(dto: OnboardTherapistDto) {
    const { email, full_name, phone, password } = dto;

    if (
      await this.prismaClient.user.findFirst({
        where: { OR: [{ email }, { phone }] },
      })
    ) {
      throw new BadRequestException(
        'A user with this email or phone number already exists',
      );
    }

    const hashedPassword = await this.authUtil.hashPassword(password);

    return this.prismaClient.user.create({
      data: {
        email,
        full_name,
        phone,
        password: hashedPassword,
        role: Role.THERAPIST,
      },
      select: userSafeSelect,
    });
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

  private async assertTherapist(id: string) {
    const therapist = await this.adminUserService.findOne(id);
    if (therapist.role !== Role.THERAPIST) {
      throw new BadRequestException(`User ${id} is not a therapist`);
    }
    return therapist;
  }
}
