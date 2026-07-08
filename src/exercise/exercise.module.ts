import { Module } from '@nestjs/common';
import { ExerciseService } from './exercise.service';
import { ExerciseController } from './exercise.controller';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage, memoryStorage as multerMemoryStorage } from 'multer';

@Module({
  controllers: [ExerciseController],
  providers: [ExerciseService],
  exports: [ExerciseService],
  imports: [MulterModule.register({ storage: memoryStorage() })],
})
export class ExerciseModule {}
