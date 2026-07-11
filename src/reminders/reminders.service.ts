import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../global/prisma/prisma.service';
import { NotificationsService } from '../integrations/notifications/notifications.service';
import { ReminderChannel, SessionStatus } from '../../generated/prisma/enums';

function startOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay(); // 0 = Sunday
  const diff = (day + 6) % 7; // days since Monday
  result.setDate(result.getDate() - diff);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

@Injectable()
export class RemindersService {
  private readonly logger = new Logger(RemindersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  // Once a day, nudge patients who haven't hit their weekly session target
  // for any of their active programs. Dedupes via Program.last_reminded_at
  // so a patient gets at most one reminder per program per day.
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDueReminders(): Promise<void> {
    const now = new Date();
    const weekStart = startOfWeek(now);

    const programs = await this.prisma.program.findMany({
      where: { is_active: true, start_date: { lte: now }, end_date: { gte: now } },
      include: { patient: true, exercise: true },
    });

    for (const program of programs) {
      if (program.last_reminded_at && isSameDay(program.last_reminded_at, now)) {
        continue;
      }

      const sessionsThisWeek = await this.prisma.session.count({
        where: {
          program_id: program.id,
          status: SessionStatus.DONE,
          completed_at: { gte: weekStart },
        },
      });

      if (sessionsThisWeek >= program.freq_per_week) continue;

      const message = `Time for your "${program.exercise.name}" exercise — you've done ${sessionsThisWeek}/${program.freq_per_week} sessions this week.`;

      try {
        await this.notifications.notify(program.patient, {
          title: 'RehabWise reminder',
          body: message,
        });

        await this.prisma.$transaction([
          this.prisma.reminder.create({
            data: {
              patient_id: program.patient_id,
              program_id: program.id,
              message,
              channels: [
                ReminderChannel.IN_APP,
                ReminderChannel.EMAIL,
                ReminderChannel.SMS,
                ...(program.patient.fcm_token ? [ReminderChannel.PUSH] : []),
              ],
            },
          }),
          this.prisma.program.update({
            where: { id: program.id },
            data: { last_reminded_at: now },
          }),
        ]);
      } catch (err: any) {
        this.logger.error(
          `Failed to send reminder for program ${program.id}: ${err.message}`,
        );
      }
    }
  }

  listForPatient(patientId: string) {
    return this.prisma.reminder.findMany({
      where: { patient_id: patientId },
      orderBy: { sent_at: 'desc' },
    });
  }

  async markRead(patientId: string, id: string) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id } });
    if (!reminder || reminder.patient_id !== patientId) {
      throw new NotFoundException(`Reminder ${id} not found`);
    }

    return this.prisma.reminder.update({ where: { id }, data: { read: true } });
  }
}
