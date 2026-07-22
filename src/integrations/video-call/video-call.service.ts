import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface DailyRoomResponse {
  name?: string;
  url?: string;
}

interface DailyErrorResponse {
  error?: string;
  info?: string;
}

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

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        properties: {
          enable_chat: true,
          start_video_off: false,
          start_audio_off: false,
          enable_knocking: true,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorPayload = this.tryParseJson<DailyErrorResponse>(errorText);
      const isAlreadyExistsError =
        response.status === 409 ||
        (errorPayload?.error === 'invalid-request-error' &&
          /already exists/i.test(errorPayload.info ?? ''));

      if (isAlreadyExistsError) {
        const roomUrl = `${domain}/${roomName}`;
        return {
          roomName,
          joinUrl: roomUrl,
          provider: 'daily',
          apiKeyConfigured: true,
          createdAt: new Date().toISOString(),
        };
      }

      throw new InternalServerErrorException(
        `Failed to create Daily room: ${errorText}`,
      );
    }

    const payload = (await response.json()) as DailyRoomResponse;
    const createdRoomName = payload.name || roomName;
    const roomUrl = `${domain}/${createdRoomName}`;

    return {
      roomName: createdRoomName,
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

  private tryParseJson<T>(value: string): T | null {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
}
