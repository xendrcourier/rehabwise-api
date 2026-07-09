import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminProgramService } from '../services/admin.program.service';
import { AdminGuard } from '../../global/guards/admin.guard';
import { CreateProgramDto } from '../../program/dtos/create-program.dto';

@UseGuards(AdminGuard)
@Controller('admin/programs')
export class AdminProgramController {
  constructor(private readonly adminProgramService: AdminProgramService) {}

  @Post()
  create(@Body() dto: CreateProgramDto) {
    return this.adminProgramService.create(dto);
  }
}
