import { VideoCallService } from './video-call.service';

describe('VideoCallService', () => {
  let service: VideoCallService;

  beforeEach(() => {
    service = new VideoCallService();
  });

  it('creates a deterministic room for a therapist-patient pair', async () => {
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
    expect(first.provider).toBe('jitsi');
  });
});
