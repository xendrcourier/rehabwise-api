import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../global/prisma/prisma.service';
import { CreateExerciseDto } from './dtos/create-exercise.dto';
import { UpdateExerciseDto } from './dtos/update-exercise.dto';
import { SessionStatus } from '../../generated/prisma/enums';
import { StorageService } from '../integrations/storage/storage.service';
import { extname } from 'path';

// R2/S3 presigned URLs cap out at 7 days
const VIDEO_URL_EXPIRY_SECONDS = 7 * 24 * 60 * 60;

@Injectable()
export class ExerciseService {
  constructor(
    private prismaClient: PrismaService,
    private storageService: StorageService,
  ) {}

  async create(dto: CreateExerciseDto) {
    // If next_exercise_id provided, verify it exists
    if (dto.next_exercise_id) {
      await this.findOne(dto.next_exercise_id);
    }
    return this.prismaClient.exercise.create({ data: dto });
  }

  async findAll() {
    return this.prismaClient.exercise.findMany({
      orderBy: [{ body_part: 'asc' }, { difficulty: 'asc' }],
      include: { next_exercise: true },
    });
  }

  async findOne(id: string) {
    const exercise = await this.prismaClient.exercise.findUnique({
      where: { id },
      include: { next_exercise: true },
    });
    if (!exercise) throw new NotFoundException(`Exercise ${id} not found`);
    return exercise;
  }

  async update(id: string, dto: UpdateExerciseDto) {
    await this.findOne(id);
    return this.prismaClient.exercise.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const activePrograms = await this.prismaClient.program.count({
      where: { exercise_id: id, is_active: true },
    });

    if (activePrograms > 0) {
      throw new BadRequestException(
        `Cannot delete — exercise is assigned to ${activePrograms} active program(s)`,
      );
    }

    return this.prismaClient.exercise.delete({ where: { id } });
  }

  async updateVideoPath(id: string, video_watch_url: string) {
    await this.findOne(id);
    return this.prismaClient.exercise.update({
      where: { id },
      data: { video_watch_url },
    });
  }

  // Upload a video file to R2 and store a signed playback URL on the exercise
  async uploadVideo(id: string, file: Express.Multer.File) {
    await this.findOne(id);

    if (!file.mimetype.startsWith('video/')) {
      throw new BadRequestException('File must be a video');
    }

    const key = `exercises/${id}/${Date.now()}${extname(file.originalname)}`;
    const path = await this.storageService.uploadVideo(
      key,
      file.buffer,
      file.mimetype,
    );
    const video_watch_url = await this.storageService.getSignedUrl(
      path,
      VIDEO_URL_EXPIRY_SECONDS,
    );

    return this.updateVideoPath(id, video_watch_url);
  }

  // Link two exercises into a progression chain
  async linkProgression(fromId: string, toId: string) {
    // Validate both exist
    const [from, to] = await Promise.all([
      this.findOne(fromId),
      this.findOne(toId),
    ]);

    // Enforce difficulty order
    const order = { easy: 0, medium: 1, hard: 2 };
    if (order[from.difficulty] >= order[to.difficulty]) {
      throw new BadRequestException(
        `Progression must go from easier to harder. 
         "${from.name}" (${from.difficulty}) cannot progress to 
         "${to.name}" (${to.difficulty})`,
      );
    }

    return this.prismaClient.exercise.update({
      where: { id: fromId },
      data: { next_exercise_id: toId },
      include: { next_exercise: true },
    });
  }

  // Get the full progression chain starting from an exercise
  async getProgressionChain(id: string) {
    const chain: Awaited<ReturnType<typeof this.findOne>>[] = [];
    let current = await this.findOne(id);

    while (current) {
      chain.push(current);
      if (!current.next_exercise_id) break;
      current = await this.findOne(current.next_exercise_id);
    }

    return chain;
  }

  async findGroupedByBodyPart() {
    const exercises = await this.prismaClient.exercise.findMany({
      orderBy: [{ body_part: 'asc' }, { difficulty: 'asc' }],
      include: { next_exercise: true },
    });

    return exercises.reduce(
      (groups, exercise) => {
        const key = exercise.body_part;
        if (!groups[key]) groups[key] = [];
        groups[key].push(exercise);
        return groups;
      },
      {} as Record<string, typeof exercises>,
    );
  }

  // Called by SessionsService after every completed session
  async checkAndUnlockProgression(
    patientId: string,
    programId: string,
    exerciseId: string,
  ) {
    const exercise = await this.findOne(exerciseId);

    // No next level — patient is already at hard
    if (!exercise.next_exercise_id || !exercise.next_exercise) return null;

    // Count completed sessions for this specific program
    const completedSessions = await this.prismaClient.session.count({
      where: {
        patient_id: patientId,
        program_id: programId,
        status: SessionStatus.DONE,
      },
    });

    if (completedSessions < exercise.sessions_to_unlock_next) return null;

    // Check if patient already has the next exercise unlocked
    const alreadyUnlocked = await this.prismaClient.program.findFirst({
      where: {
        patient_id: patientId,
        exercise_id: exercise.next_exercise_id,
        is_active: true,
      },
    });

    if (alreadyUnlocked) return null;

    // Get the current program to copy its dates
    const currentProgram = await this.prismaClient.program.findUnique({
      where: { id: programId },
    });
    if (!currentProgram) {
      throw new NotFoundException(`Program ${programId} not found`);
    }

    // Unlock next level — create a new program for the patient
    const nextProgram = await this.prismaClient.program.create({
      data: {
        patient_id: patientId,
        exercise_id: exercise.next_exercise_id,
        sets: exercise.next_exercise.default_sets,
        reps: exercise.next_exercise.default_reps,
        freq_per_week: currentProgram.freq_per_week,
        start_date: new Date(),
        end_date: currentProgram.end_date,
        is_active: true,
      },
      include: { exercise: true },
    });

    // Deactivate the current program — patient has graduated
    await this.prismaClient.program.update({
      where: { id: programId },
      data: { is_active: false },
    });

    return nextProgram; // caller uses this to notify the patient
  }
}
