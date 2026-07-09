import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../global/prisma/prisma.service';
import { CreateProgramDto } from './dtos/create-program.dto';
import { Role } from '../../generated/prisma/enums';

@Injectable()
export class ProgramService {
  constructor(private prismaClient: PrismaService) {}

  // Assign an exercise to a patient
  async create(dto: CreateProgramDto) {
    const patient = await this.prismaClient.user.findUnique({
      where: { id: dto.patient_id },
    });
    if (!patient) {
      throw new NotFoundException(`Patient ${dto.patient_id} not found`);
    }
    if (patient.role !== Role.PATIENT) {
      throw new BadRequestException('Programs can only be assigned to patients');
    }

    const exercise = await this.prismaClient.exercise.findUnique({
      where: { id: dto.exercise_id },
    });
    if (!exercise) {
      throw new NotFoundException(`Exercise ${dto.exercise_id} not found`);
    }

    const start_date = new Date(dto.start_date);
    const end_date = new Date(dto.end_date);
    if (end_date <= start_date) {
      throw new BadRequestException('end_date must be after start_date');
    }

    return this.prismaClient.program.create({
      data: {
        patient_id: dto.patient_id,
        exercise_id: dto.exercise_id,
        sets: dto.sets,
        reps: dto.reps,
        freq_per_week: dto.freq_per_week,
        start_date,
        end_date,
      },
      include: { exercise: true },
    });
  }
}
