import { Injectable } from '@nestjs/common';
import { ProgramService } from '../../program/program.service';
import { CreateProgramDto } from '../../program/dtos/create-program.dto';

@Injectable()
export class AdminProgramService {
  constructor(private readonly programService: ProgramService) {}

  create(dto: CreateProgramDto) {
    return this.programService.create(dto);
  }
}
