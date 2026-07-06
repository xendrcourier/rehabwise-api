import { Injectable } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service';
import { AuthLoginDto } from '../../auth/dtos/auth.login.dto';
import { AuthRefreshDto } from '../../auth/dtos/auth.refresh.dto';
import { Role } from 'generated/prisma/enums';

@Injectable()
export class AdminAuthService {
  constructor(private readonly authService: AuthService) {}

  login(dto: AuthLoginDto) {
    return this.authService.login(dto, Role.ADMIN);
  }

  logout(dto: AuthRefreshDto) {
    return this.authService.logout(dto);
  }

  refresh(dto: AuthRefreshDto) {
    return this.authService.refresh(dto);
  }
}
