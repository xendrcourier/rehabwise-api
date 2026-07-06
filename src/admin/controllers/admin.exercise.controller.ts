import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminExerciseService } from '../services/admin.exercise.service';
import { AdminGuard } from '../../global/guards/admin.guard';
import { CreateExerciseDto } from '../../exercise/dtos/create-exercise.dto';
import { UpdateExerciseDto } from '../../exercise/dtos/update-exercise.dto';
import { UpdateExerciseVideoDto } from '../../exercise/dtos/update-exercise-video.dto';

@UseGuards(AdminGuard)
@Controller('admin/exercises')
export class AdminExerciseController {
  constructor(private readonly adminExerciseService: AdminExerciseService) {}

  @Post()
  create(@Body() dto: CreateExerciseDto) {
    return this.adminExerciseService.create(dto);
  }

  @Get()
  findAll() {
    return this.adminExerciseService.findAll();
  }

  @Get('grouped')
  findGroupedByBodyPart() {
    return this.adminExerciseService.findGroupedByBodyPart();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.adminExerciseService.findOne(id);
  }

  @Get(':id/progression-chain')
  getProgressionChain(@Param('id') id: string) {
    return this.adminExerciseService.getProgressionChain(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateExerciseDto) {
    return this.adminExerciseService.update(id, dto);
  }

  @Patch(':id/video')
  updateVideoPath(
    @Param('id') id: string,
    @Body() dto: UpdateExerciseVideoDto,
  ) {
    return this.adminExerciseService.updateVideoPath(id, dto);
  }

  @Post(':fromId/link/:toId')
  linkProgression(
    @Param('fromId') fromId: string,
    @Param('toId') toId: string,
  ) {
    return this.adminExerciseService.linkProgression(fromId, toId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.adminExerciseService.remove(id);
  }
}
