import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { JwtAuthGuard } from './global/guards/jwt-auth.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ExerciseModule } from './exercise/exercise.module';
import { ProgramModule } from './program/program.module';
import { PrismaModule } from './global/prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { StorageModule } from './integrations/storage/storage.module';
import { CloudinaryModule } from './integrations/cloudinary/cloudinary.module';
import { NotificationsModule } from './integrations/notifications/notifications.module';
import { TherapistModule } from './therapist/therapist.module';
import { PatientModule } from './patient/patient.module';
import { RemindersModule } from './reminders/reminders.module';
import { VideoCallModule } from './integrations/video-call/video-call.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 20,
      },
    ]),
    PrismaModule,
    AuthModule,
    ExerciseModule,
    ProgramModule,
    AdminModule,
    StorageModule,
    CloudinaryModule,
    NotificationsModule,
    TherapistModule,
    PatientModule,
    RemindersModule,
    VideoCallModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
