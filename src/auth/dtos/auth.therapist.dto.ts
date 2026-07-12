import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsPhoneNumber,
  Matches,
  MinLength,
} from 'class-validator';

export class OnboardTherapistDto {
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

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password is too weak. It must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character.',
  })
  password!: string;
}

// Admin-created therapist: no password — the therapist sets one themselves
// via the invite link emailed to them.
export class InviteTherapistDto {
  @IsString()
  @IsNotEmpty()
  full_name!: string;

  @IsEmail({}, { message: 'Invalid email format' })
  email!: string;

  @IsPhoneNumber('NG', {
    message: 'Phone must be a valid international number',
  })
  phone!: string;
}

export class SetTherapistPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password is too weak. It must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number or special character.',
  })
  password!: string;
}
