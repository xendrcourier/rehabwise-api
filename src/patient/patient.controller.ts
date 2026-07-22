import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { JwtGuard } from '../global/guards/jwt.guard';
import { CurrentUser } from '../global/decorators/current.user.decorator';
import { RegisterDeviceTokenDto } from './dtos/register-device-token.dto';
import { LogSessionDto } from '../session/dtos/log-session.dto';

@UseGuards(JwtGuard)
@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('programs')
  getPrograms(@CurrentUser('id') patientId: string) {
    return this.patientService.getPrograms(patientId);
  }

  @Get('programs/:programId')
  getProgram(
    @CurrentUser('id') patientId: string,
    @Param('programId') programId: string,
  ) {
    return this.patientService.getProgram(patientId, programId);
  }

  @Get('programs/:programId/video')
  getProgramVideo(
    @CurrentUser('id') patientId: string,
    @Param('programId') programId: string,
  ) {
    return this.patientService.getProgramVideoUrl(patientId, programId);
  }

  @Post('video-call/:therapistId')
  createVideoCallLink(
    @CurrentUser('id') patientId: string,
    @Param('therapistId') therapistId: string,
  ) {
    return this.patientService.createVideoCallLink(patientId, therapistId);
  }

  @Post('sessions')
  logSession(@CurrentUser('id') patientId: string, @Body() dto: LogSessionDto) {
    return this.patientService.logSession(patientId, dto);
  }

  @Patch('device-token')
  registerDeviceToken(
    @CurrentUser('id') patientId: string,
    @Body() dto: RegisterDeviceTokenDto,
  ) {
    return this.patientService.updateFcmToken(patientId, dto.fcm_token);
  }

  @Get('reminders')
  listReminders(@CurrentUser('id') patientId: string) {
    return this.patientService.listReminders(patientId);
  }

  @Patch('reminders/:reminderId/read')
  markReminderRead(
    @CurrentUser('id') patientId: string,
    @Param('reminderId') reminderId: string,
  ) {
    return this.patientService.markReminderRead(patientId, reminderId);
  }
}
