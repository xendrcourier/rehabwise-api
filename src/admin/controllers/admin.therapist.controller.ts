import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminTherapistService } from '../services/admin.therapist.service';
import { AdminGuard } from '../../global/guards/admin.guard';
import { InviteTherapistDto } from '../../auth/dtos/auth.therapist.dto';
import { ReassignPatientDto } from '../dtos/reassign-patient.dto';

@UseGuards(AdminGuard)
@Controller('admin/therapists')
export class AdminTherapistController {
  constructor(private readonly adminTherapistService: AdminTherapistService) {}

  @Post()
  create(@Body() dto: InviteTherapistDto) {
    return this.adminTherapistService.create(dto);
  }

  @Get()
  findAll() {
    return this.adminTherapistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminTherapistService.findOne(id);
  }

  @Get(':id/patients')
  getPatients(@Param('id') id: string) {
    return this.adminTherapistService.getPatients(id);
  }

  @Patch('patients/:patientId/reassign')
  reassignPatient(
    @Param('patientId') patientId: string,
    @Body() dto: ReassignPatientDto,
  ) {
    return this.adminTherapistService.reassignPatient(patientId, dto);
  }

  @Delete(':id')
  deleteTherapist(@Param('id') id: string) {
    return this.adminTherapistService.deleteTherapist(id);
  }
}
