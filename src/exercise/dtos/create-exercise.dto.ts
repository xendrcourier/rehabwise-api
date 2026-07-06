import {
  IsString,
  IsInt,
  IsOptional,
  Min,
  Max,
  MinLength,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateExerciseDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  body_part!: string;

  @IsInt()
  @Min(1)
  @Max(10)
  @Type(() => Number)
  default_sets!: number;

  @IsInt()
  @Min(1)
  @Max(30)
  @Type(() => Number)
  default_reps!: number;

  // Storage paths — set after video upload to R2
  // Optional on create, therapist uploads videos separately
  @IsString()
  @IsUrl()
  video_watch_path?: string;

  @IsString()
  @IsUrl()
  exercise_img_url!: string;
}
