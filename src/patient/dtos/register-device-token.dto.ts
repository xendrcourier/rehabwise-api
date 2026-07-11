import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDeviceTokenDto {
  @IsString()
  @IsNotEmpty()
  fcm_token!: string;
}
