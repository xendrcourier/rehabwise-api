import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class OnboardTherapistDto {
  @IsNotEmpty()
  full_name!: string;

  @IsEmail()
  email?: string;

  @IsString()
  phone!: string;
}
