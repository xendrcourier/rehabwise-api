import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
  IsPhoneNumber,
} from 'class-validator';

export class AuthLoginDto {
  @ValidateIf((o) => !o.phone || o.email)
  @IsNotEmpty({ message: 'Email is required if phone number is not provided' })
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  @ValidateIf((o) => !o.email || o.phone)
  @IsNotEmpty({ message: 'Phone number is required if email is not provided' })
  @IsPhoneNumber('NG', {
    message: 'Please provide a valid Nigerian phone number',
  })
  phone?: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;
}
