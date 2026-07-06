import { Module } from '@nestjs/common';
import { AdminExerciseController } from './controllers/admin.exercise.controller';
import { AdminExerciseService } from './services/admin.exercise.service';

@Module({
  controllers: [AdminExerciseController],
  providers: [AdminExerciseService],
})
export class AdminModule {}
