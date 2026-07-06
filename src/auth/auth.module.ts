import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthUtilService } from './auth.utils';
import { JwtStrategy } from '../global/strategies/jwt.strategy';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [AuthService, AuthUtilService, JwtStrategy],
  exports: [AuthUtilService],
})
export class AuthModule {}
