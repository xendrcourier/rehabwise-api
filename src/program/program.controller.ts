import { Controller } from '@nestjs/common';
import { ProgramService } from './program.service';

@Controller('program')
export class ProgramController {
  constructor(private readonly programService: ProgramService) {}
}
