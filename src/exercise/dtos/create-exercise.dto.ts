import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  Min,
  Max,
  MinLength,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DifficultyLevel } from '../../../generated/prisma/enums';

export class CreateExerciseDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  body_part!: string;

  @IsString()
  procedure!: string;

  @IsString()
  progression!: string;

  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

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

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  sessions_to_unlock_next?: number;

  @IsOptional()
  @IsString()
  next_exercise_id?: string;

  @IsString()
  @IsUrl()
  video_watch_url!: string;

  @IsString()
  @IsUrl()
  exercise_img_url!: string;
}
