import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { ProgramModule } from '../program/program.module';
import { AdminAuthController } from './controllers/admin.auth.controller';
import { AdminUserController } from './controllers/admin.user.controller';
import { AdminTherapistController } from './controllers/admin.therapist.controller';
import { AdminExerciseController } from './controllers/admin.exercise.controller';
import { AdminProgramController } from './controllers/admin.program.controller';
import { AdminAuthService } from './services/admin.auth.service';
import { AdminUserService } from './services/admin.user.service';
import { AdminTherapistService } from './services/admin.therapist.service';
import { AdminExerciseService } from './services/admin.exercise.service';
import { AdminProgramService } from './services/admin.program.service';

@Module({
  imports: [AuthModule, ExerciseModule, ProgramModule],
  controllers: [
    AdminAuthController,
    AdminUserController,
    AdminTherapistController,
    AdminExerciseController,
    AdminProgramController,
  ],
  providers: [
    AdminAuthService,
    AdminUserService,
    AdminTherapistService,
    AdminExerciseService,
    AdminProgramService,
  ],
})
export class AdminModule {}
