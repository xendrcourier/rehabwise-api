import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SessionStatus } from 'generated/prisma/enums';

export class LogSessionDto {
  @IsUUID()
  program_id!: string;

  @IsEnum(SessionStatus)
  status!: SessionStatus;

  @IsBoolean()
  @Type(() => Boolean)
  watch_demo!: boolean;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  sets_done!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  pain_before?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  pain_after?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  confusion_flag?: boolean;
}
