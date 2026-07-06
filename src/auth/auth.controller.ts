import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OnboardTherapistDto } from './dtos/auth.therapist.dto';
import { OnboardPatientDto } from './dtos/auth.patient.dto';
import { AuthLoginDto } from './dtos/auth.login.dto';
import { AuthRefreshDto } from './dtos/auth.refresh.dto';
import { Role } from 'generated/prisma/enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('onboard/therapist')
  onboardTherapist(@Body() dto: OnboardTherapistDto) {
    return this.authService.onboardTherapist(dto);
  }

  @Post('onboard/patient')
  onboardPatient(@Body() dto: OnboardPatientDto) {
    return this.authService.onboardUser(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login/therapist')
  loginTherapist(@Body() dto: AuthLoginDto) {
    return this.authService.login(dto, Role.THERAPIST);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login/patient')
  loginPatient(@Body() dto: AuthLoginDto) {
    return this.authService.login(dto, Role.PATIENT);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Body() dto: AuthRefreshDto) {
    return this.authService.logout(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: AuthRefreshDto) {
    return this.authService.refresh(dto);
  }
}
