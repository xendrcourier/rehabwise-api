import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/global/prisma/prisma.service';
import { ExerciseService } from '../exercise/exercise.service';
import { ProgramService } from '../program/program.service';
import { CreateProgramDto } from '../program/dtos/create-program.dto';
import { Role } from 'generated/prisma/enums';

const patientSafeSelect = {
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
export class TherapistService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exerciseService: ExerciseService,
    private readonly programService: ProgramService,
  ) {}

  async getPatients(therapistId: string) {
    return this.prisma.user.findMany({
      where: { therapist_id: therapistId },
      select: patientSafeSelect,
      orderBy: { enrolled_at: 'desc' },
    });
  }

  async getPatient(therapistId: string, patientId: string) {
    return this.assertOwnPatient(therapistId, patientId);
  }

  async getPatientPrograms(therapistId: string, patientId: string) {
    await this.assertOwnPatient(therapistId, patientId);
    return this.programService.findByPatient(patientId);
  }

  listExercises() {
    return this.exerciseService.findAll();
  }

  async assignProgram(therapistId: string, dto: CreateProgramDto) {
    await this.assertOwnPatient(therapistId, dto.patient_id);
    return this.programService.create(dto);
  }

  listAlerts(therapistId: string) {
    return this.prisma.alert.findMany({
      where: { therapist_id: therapistId, resolved: false },
      include: { patient: { select: patientSafeSelect } },
      orderBy: { triggered_at: 'desc' },
    });
  }

  async resolveAlert(therapistId: string, alertId: string) {
    const alert = await this.prisma.alert.findUnique({ where: { id: alertId } });
    if (!alert || alert.therapist_id !== therapistId) {
      throw new NotFoundException(`Alert ${alertId} not found`);
    }

    return this.prisma.alert.update({
      where: { id: alertId },
      data: { resolved: true, resolved_at: new Date() },
    });
  }

  private async assertOwnPatient(therapistId: string, patientId: string) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      select: patientSafeSelect,
    });

    if (
      !patient ||
      patient.role !== Role.PATIENT ||
      patient.therapist_id !== therapistId
    ) {
      throw new NotFoundException(`Patient ${patientId} not found`);
    }

    return patient;
  }
}
