import { Controller } from '@nestjs/common';
import { TherapistService } from './therapist.service';

@Controller('therapist')
export class TherapistController {
  constructor(private readonly therapistService: TherapistService) {}
}
