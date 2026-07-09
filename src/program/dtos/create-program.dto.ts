import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProgramDto {
  @IsUUID()
  patient_id!: string;

  @IsUUID()
  exercise_id!: string;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  sets!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  reps!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  freq_per_week!: number;

  @IsDateString()
  start_date!: string;

  @IsDateString()
  end_date!: string;
}
