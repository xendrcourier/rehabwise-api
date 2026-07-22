import { Module } from '@nestjs/common';
import { TherapistService } from './therapist.service';
import { TherapistController } from './therapist.controller';
import { PrismaModule } from 'src/global/prisma/prisma.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { ProgramModule } from '../program/program.module';
import { VideoCallModule } from 'src/integrations/video-call/video-call.module';

@Module({
  controllers: [TherapistController],
  providers: [TherapistService],
  imports: [PrismaModule, ExerciseModule, ProgramModule, VideoCallModule],
})
export class TherapistModule {}
