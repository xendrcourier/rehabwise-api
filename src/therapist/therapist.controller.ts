import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TherapistService } from './therapist.service';
import { TherapistGuard } from '../global/guards/therapist.guard';
import { CurrentUser } from '../global/decorators/current.user.decorator';
import { CreateProgramDto } from '../program/dtos/create-program.dto';

@UseGuards(TherapistGuard)
@Controller('therapist')
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}

  @Get('patients')
  getPatients(@CurrentUser('id') therapistId: string) {
    return this.therapistService.getPatients(therapistId);
  }

  @Get('patients/:patientId')
  getPatient(
    @CurrentUser('id') therapistId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.therapistService.getPatient(therapistId, patientId);
  }

  @Get('patients/:patientId/programs')
  getPatientPrograms(
    @CurrentUser('id') therapistId: string,
    @Param('patientId') patientId: string,
  ) {
    return this.therapistService.getPatientPrograms(therapistId, patientId);
  }

  @Get('exercises')
  listExercises() {
    return this.therapistService.listExercises();
  }

  @Post('programs')
  assignProgram(
    @CurrentUser('id') therapistId: string,
    @Body() dto: CreateProgramDto,
  ) {
    return this.therapistService.assignProgram(therapistId, dto);
  }
}
