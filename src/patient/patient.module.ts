import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { PrismaModule } from '../global/prisma/prisma.module';
import { ProgramModule } from '../program/program.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { RemindersModule } from '../reminders/reminders.module';
import { SessionModule } from '../session/session.module';
import { VideoCallModule } from 'src/integrations/video-call/video-call.module';

@Module({
  controllers: [PatientController],
  providers: [PatientService],
  imports: [
    PrismaModule,
    ProgramModule,
    ExerciseModule,
    RemindersModule,
    SessionModule,
    VideoCallModule,
  ],
})
export class PatientModule {}
