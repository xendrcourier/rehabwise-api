import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../global/prisma/prisma.service';
import { ExerciseService } from '../exercise/exercise.service';
import { NotificationsService } from '../integrations/notifications/notifications.service';
import { LogSessionDto } from './dtos/log-session.dto';
import { AlertType, SessionStatus } from 'generated/prisma/enums';

// pain_after at or above this (0-10 scale) raises a PAIN alert for the therapist
const PAIN_ALERT_THRESHOLD = 7;

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exerciseService: ExerciseService,
    private readonly notifications: NotificationsService,
  ) {}

  async logSession(patientId: string, dto: LogSessionDto) {
    const program = await this.prisma.program.findUnique({
      where: { id: dto.program_id },
      include: { exercise: true, patient: true },
    });

    if (!program || program.patient_id !== patientId) {
      throw new NotFoundException(`Program ${dto.program_id} not found`);
    }
    if (!program.is_active) {
      throw new BadRequestException('Program is not active');
    }

    const now = new Date();
    const session = await this.prisma.session.create({
      data: {
        patient_id: patientId,
        program_id: program.id,
        scheduled_date: now,
        completed_at: dto.status === SessionStatus.MISSED ? null : now,
        watch_demo: dto.watch_demo,
        sets_done: dto.sets_done,
        pain_before: dto.pain_before,
        pain_after: dto.pain_after,
        confusion_flag: dto.confusion_flag ?? false,
        status: dto.status,
      },
    });

    await this.raiseAlertsIfNeeded(program, dto);

    let unlockedProgram: Awaited<
      ReturnType<typeof this.exerciseService.checkAndUnlockProgression>
    > = null;
    if (dto.status === SessionStatus.DONE) {
      unlockedProgram = await this.exerciseService.checkAndUnlockProgression(
        patientId,
        program.id,
        program.exercise_id,
      );

      if (unlockedProgram) {
        await this.notifications.notify(program.patient, {
          title: 'New exercise unlocked!',
          body: `You've leveled up to "${unlockedProgram.exercise.name}".`,
        });
      }
    }

    return { session, unlockedProgram };
  }

  private async raiseAlertsIfNeeded(
    program: { patient_id: string; patient: { therapist_id: string | null } },
    dto: LogSessionDto,
  ) {
    if (!program.patient.therapist_id) return;

    const triggers: AlertType[] = [];
    if (dto.status === SessionStatus.MISSED) triggers.push(AlertType.MISSED);
    if (dto.confusion_flag) triggers.push(AlertType.CONFUSION);
    if (dto.pain_after != null && dto.pain_after >= PAIN_ALERT_THRESHOLD) {
      triggers.push(AlertType.PAIN);
    }

    if (!triggers.length) return;

    await this.prisma.alert.createMany({
      data: triggers.map((alert_type) => ({
        alert_type,
        patient_id: program.patient_id,
        therapist_id: program.patient.therapist_id!,
      })),
    });
  }
}
