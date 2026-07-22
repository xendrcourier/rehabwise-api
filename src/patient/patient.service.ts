import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../global/prisma/prisma.service';
import { ProgramService } from '../program/program.service';
import { ExerciseService } from '../exercise/exercise.service';
import { RemindersService } from '../reminders/reminders.service';
import { SessionService } from '../session/session.service';
import { LogSessionDto } from '../session/dtos/log-session.dto';
import { VideoCallService } from '../integrations/video-call/video-call.service';

@Injectable()
export class PatientService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly programService: ProgramService,
    private readonly exerciseService: ExerciseService,
    private readonly remindersService: RemindersService,
    private readonly sessionService: SessionService,
    private readonly videoCallService: VideoCallService,
  ) {}

  logSession(patientId: string, dto: LogSessionDto) {
    return this.sessionService.logSession(patientId, dto);
  }

  getPrograms(patientId: string) {
    return this.programService.findByPatient(patientId);
  }

  getProgram(patientId: string, programId: string) {
    return this.assertOwnProgram(patientId, programId);
  }

  async getProgramVideoUrl(patientId: string, programId: string) {
    const program = await this.assertOwnProgram(patientId, programId);
    const url = await this.exerciseService.getPlaybackUrl(program.exercise_id);
    if (!url) {
      throw new NotFoundException('No video available for this exercise');
    }
    return { url };
  }

  async createVideoCallLink(patientId: string, therapistId: string) {
    const patient = await this.prisma.user.findUnique({
      where: { id: patientId },
      select: { id: true, therapist_id: true },
    });

    if (!patient || patient.therapist_id !== therapistId) {
      throw new NotFoundException('Therapist relationship not found');
    }

    return this.videoCallService.createSession({
      initiatorId: patientId,
      participantId: therapistId,
      participantName: 'Patient Session',
    });
  }

  updateFcmToken(patientId: string, fcm_token: string) {
    return this.prisma.user.update({
      where: { id: patientId },
      data: { fcm_token },
      select: { id: true },
    });
  }

  listReminders(patientId: string) {
    return this.remindersService.listForPatient(patientId);
  }

  markReminderRead(patientId: string, reminderId: string) {
    return this.remindersService.markRead(patientId, reminderId);
  }

  private async assertOwnProgram(patientId: string, programId: string) {
    const program = await this.prisma.program.findUnique({
      where: { id: programId },
      include: { exercise: true },
    });

    if (!program || program.patient_id !== patientId) {
      throw new NotFoundException(`Program ${programId} not found`);
    }

    return program;
  }
}
