import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface CreateVideoSessionInput {
  initiatorId: string;
  participantId: string;
  participantName?: string;
}

export interface VideoSessionResponse {
  roomName: string;
  joinUrl: string;
  provider: 'daily';
  apiKeyConfigured: boolean;
  createdAt: string;
}

@Injectable()
export class VideoCallService {
  constructor(private readonly configService: ConfigService) {}
  async createSession(
    input: CreateVideoSessionInput,
  ): Promise<VideoSessionResponse> {
    const roomName = this.buildRoomName(input.initiatorId, input.participantId);
    const domain =
      this.configService.get<string>('DAILY_DOMAIN') ||
      'https://rehabwise.daily.co';
    const apiKey = this.configService.get<string>('DAILY_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'DAILY_API_KEY is not configured. Set it in the environment before creating a Daily room.',
      );
    }

    const roomUrl = `${domain}/${roomName}`;

    return {
      roomName,
      joinUrl: roomUrl,
      provider: 'daily',
      apiKeyConfigured: true,
      createdAt: new Date().toISOString(),
    };
  }

  private buildRoomName(initiatorId: string, participantId: string) {
    const slug = `${initiatorId}-${participantId}`.toLowerCase();
    return `rehabwise-${slug.replace(/[^a-z0-9]+/g, '-')}`;
  }
}
