import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../global/prisma/prisma.service';
import { Role } from 'generated/prisma/enums';

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
export class AdminUserService {
  constructor(private readonly prismaClient: PrismaService) {}

  async findAll(role?: Role) {
    return this.prismaClient.user.findMany({
      where: role ? { role } : undefined,
      select: userSafeSelect,
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prismaClient.user.findUnique({
      where: { id },
      select: userSafeSelect,
    });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async remove(id: string) {
    await this.findOne(id);

    const patientCount = await this.prismaClient.user.count({
      where: { therapist_id: id },
    });

    if (patientCount > 0) {
      throw new BadRequestException(
        `Cannot delete — this therapist has ${patientCount} assigned patient(s). Reassign them first.`,
      );
    }

    await this.prismaClient.user.delete({ where: { id } });
    return { message: 'User deleted' };
  }

  async verifyPatient(id: string) {
    const user = await this.findOne(id);

    if (user.role !== Role.PATIENT) {
      throw new BadRequestException('Only patients can be verified');
    }

    return this.prismaClient.user.update({
      where: { id },
      data: { isVerified: true },
      select: userSafeSelect,
    });
  }
}
