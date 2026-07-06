import { IsString, IsUrl } from 'class-validator';

export class UpdateExerciseVideoDto {
  @IsString()
  @IsUrl()
  video_watch_url!: string;
}
