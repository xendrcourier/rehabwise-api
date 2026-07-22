import { ConfigService } from '@nestjs/config';
import { VideoCallService } from './video-call.service';

describe('VideoCallService', () => {
  let service: VideoCallService;

  beforeEach(() => {
    const config = {
      get: jest.fn((key: string) => {
        if (key === 'DAILY_API_KEY') return 'test-api-key';
        if (key === 'DAILY_DOMAIN') return 'https://rehabwise.daily.co';
        return undefined;
      }),
    } as unknown as ConfigService;

    service = new VideoCallService(config);
  });

  it('creates a deterministic Daily room for a therapist-patient pair', async () => {
    const first = await service.createSession({
      initiatorId: 'therapist-1',
      participantId: 'patient-1',
      participantName: 'Dr. Rivera',
    });

    const second = await service.createSession({
      initiatorId: 'therapist-1',
      participantId: 'patient-1',
      participantName: 'Dr. Rivera',
    });

    expect(first.roomName).toBe(second.roomName);
    expect(first.joinUrl).toContain(first.roomName);
    expect(first.provider).toBe('daily');
    expect(first.apiKeyConfigured).toBe(true);
  });
});
