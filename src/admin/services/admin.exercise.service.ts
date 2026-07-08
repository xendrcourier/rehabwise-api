import { Injectable } from '@nestjs/common';
import { ExerciseService } from '../../exercise/exercise.service';
import { CreateExerciseDto } from '../../exercise/dtos/create-exercise.dto';
import { UpdateExerciseDto } from '../../exercise/dtos/update-exercise.dto';
import { UpdateExerciseVideoDto } from '../../exercise/dtos/update-exercise-video.dto';

@Injectable()
export class AdminExerciseService {
  constructor(private readonly exerciseService: ExerciseService) {}

  create(dto: CreateExerciseDto) {
    return this.exerciseService.create(dto);
  }

  findAll() {
    return this.exerciseService.findAll();
  }

  findGroupedByBodyPart() {
    return this.exerciseService.findGroupedByBodyPart();
  }

  findOne(id: string) {
    return this.exerciseService.findOne(id);
  }

  getProgressionChain(id: string) {
    return this.exerciseService.getProgressionChain(id);
  }

  update(id: string, dto: UpdateExerciseDto) {
    return this.exerciseService.update(id, dto);
  }

  updateVideoPath(id: string, dto: UpdateExerciseVideoDto) {
    return this.exerciseService.updateVideoPath(id, dto.video_watch_url);
  }

  uploadVideo(id: string, file: Express.Multer.File) {
    return this.exerciseService.uploadVideo(id, file);
  }

  linkProgression(fromId: string, toId: string) {
    return this.exerciseService.linkProgression(fromId, toId);
  }

  remove(id: string) {
    return this.exerciseService.remove(id);
  }
}
