import { Module } from '@nestjs/common';
import { TherapistService } from './therapist.service';
import { TherapistController } from './therapist.controller';
import { PrismaModule } from 'src/global/prisma/prisma.module';


@Module({
  controllers: [TherapistController],
  providers: [TherapistService],
  imports: [PrismaModule]
})
export class TherapistModule { }
