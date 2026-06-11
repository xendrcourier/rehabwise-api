import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ExerciseModule } from './exercise/exercise.module';
import { ProgramModule } from './program/program.module';

@Module({
  imports: [AuthModule, ExerciseModule, ProgramModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
