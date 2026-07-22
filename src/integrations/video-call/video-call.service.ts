import { Injectable } from '@nestjs/common';

export interface CreateVideoSessionInput {
  initiatorId: string;
  participantId: string;
  participantName?: string;
}

export interface VideoSessionResponse {
  roomName: string;
  joinUrl: string;
  provider: 'jitsi';
  createdAt: string;
}

@Injectable()
export class VideoCallService {
  async createSession(
    input: CreateVideoSessionInput,
  ): Promise<VideoSessionResponse> {
    const roomName = this.buildRoomName(input.initiatorId, input.participantId);
    const baseUrl = process.env.VIDEO_CALL_BASE_URL || 'https://meet.jit.si';
    const roomUrl = `${baseUrl}/${roomName}`;

    return {
      roomName,
      joinUrl: roomUrl,
      provider: 'jitsi',
      createdAt: new Date().toISOString(),
    };
  }

  private buildRoomName(initiatorId: string, participantId: string) {
    const slug = `${initiatorId}-${participantId}`.toLowerCase();
    return `rehabwise-${slug.replace(/[^a-z0-9]+/g, '-')}`;
  }
}
