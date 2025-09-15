import { Injectable } from '@nestjs/common';
import { StartRecordingDto } from './dto/start-recording.dto';
import { TrackService } from './services/track.service';
import { EgressService } from './services/egress.service';
import { S3ConfigService } from '../../config/s3.config';

@Injectable()
export class RecordingService {
  constructor(
    private readonly trackService: TrackService,
    private readonly egressService: EgressService,
    private readonly s3ConfigService: S3ConfigService,
  ) {}

  async startRecording(startRecordingDto: StartRecordingDto) {
    const { roomName, participantId, maxDuration = 60 } = startRecordingDto;

    try {
      const trackSid = await this.trackService.findScreenShareTrackId(
        roomName,
        participantId,
      );

      const filepath = `/records/${roomName}-${participantId}-${Date.now()}`;
      const s3Upload = this.s3ConfigService.createS3Upload();

      const result = await this.egressService.startTrackEgress({
        roomName,
        trackSid,
        filepath,
        s3Upload,
      });

      console.log('Screen share recording started:', result.egressId);

      setTimeout(() => {
        this.stopEgress(result.egressId);
      }, maxDuration * 1000);

      return result;
    } catch (error) {
      console.error('Failed to start screen share recording', error);
      throw error;
    }
  }

  async stopEgress(egressId: string) {
    return this.egressService.stopEgress(egressId);
  }
}
