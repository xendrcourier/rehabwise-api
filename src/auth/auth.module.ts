import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthUtilService } from './auth.utils';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthUtilService],
  exports: [AuthUtilService],
})
export class AuthModule {}
