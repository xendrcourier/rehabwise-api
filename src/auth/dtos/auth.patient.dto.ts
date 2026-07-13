import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  IsUUID,
  Matches,
  MinLength,
} from 'class-validator';

export class OnboardPatientDto {
  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  // Option A: Use a generic phone validator
  @IsPhoneNumber('NG', {
    message: 'Phone must be a valid international number',
  })
  phone!: string;

  @IsUUID(undefined, { message: 'therapist_id must be a valid id' })
  @IsNotEmpty({ message: 'therapist_id is required' })
  therapist_id!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password is too weak. It must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character.',
  })
  password!: string;
}
