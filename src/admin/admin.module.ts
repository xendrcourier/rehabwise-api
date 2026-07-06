import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { AdminAuthController } from './controllers/admin.auth.controller';
import { AdminUserController } from './controllers/admin.user.controller';
import { AdminTherapistController } from './controllers/admin.therapist.controller';
import { AdminExerciseController } from './controllers/admin.exercise.controller';
import { AdminAuthService } from './services/admin.auth.service';
import { AdminUserService } from './services/admin.user.service';
import { AdminTherapistService } from './services/admin.therapist.service';
import { AdminExerciseService } from './services/admin.exercise.service';

@Module({
  imports: [AuthModule, ExerciseModule],
  controllers: [
    AdminAuthController,
    AdminUserController,
    AdminTherapistController,
    AdminExerciseController,
  ],
  providers: [
    AdminAuthService,
    AdminUserService,
    AdminTherapistService,
    AdminExerciseService,
  ],
})
export class AdminModule {}
