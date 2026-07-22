import { ConfigService } from '@nestjs/config';
import { VideoCallService } from './video-call.service';

describe('VideoCallService', () => {
  let service: VideoCallService;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

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
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'rehabwise-therapist-1-patient-1' }),
    });

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
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('creates a Daily room through the API before returning the join URL', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'rehabwise-therapist-1-patient-1' }),
    });

    const result = await service.createSession({
      initiatorId: 'therapist-1',
      participantId: 'patient-1',
      participantName: 'Dr. Rivera',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.daily.co/v1/rooms',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        }),
      }),
    );
    expect(result.joinUrl).toBe(
      'https://rehabwise.daily.co/rehabwise-therapist-1-patient-1',
    );
  });
});
