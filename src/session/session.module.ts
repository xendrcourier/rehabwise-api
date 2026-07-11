import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { PrismaModule } from '../global/prisma/prisma.module';
import { ExerciseModule } from '../exercise/exercise.module';
import { NotificationsModule } from '../integrations/notifications/notifications.module';

@Module({
  imports: [PrismaModule, ExerciseModule, NotificationsModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
