import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AdminAuthService } from '../services/admin.auth.service';
import { AuthLoginDto } from '../../auth/dtos/auth.login.dto';
import { AuthRefreshDto } from '../../auth/dtos/auth.refresh.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() dto: AuthLoginDto) {
    return this.adminAuthService.login(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  logout(@Body() dto: AuthRefreshDto) {
    return this.adminAuthService.logout(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  refresh(@Body() dto: AuthRefreshDto) {
    return this.adminAuthService.refresh(dto);
  }
}
