import { Injectable } from '@nestjs/common';
import {
  DirectFileOutput,
  EgressClient,
  EgressStatus,
  EncodedFileOutput,
  EncodedFileType,
  EncodedOutputs,
  RoomServiceClient,
  S3Upload,
  SegmentedFileOutput,
  TrackType,
} from 'livekit-server-sdk';
import { StartRecordingDto } from './dto/start-recording.dto';

@Injectable()
export class RecordingService {
  constructor(
    private readonly egressClient: EgressClient,
    private readonly roomService: RoomServiceClient,
  ) {}

  async findScreenShareTrackId(
    roomName: string,
    participantId: string,
  ): Promise<string> {
    const participants = await this.roomService.listParticipants(roomName);
    const participant = participants.find((p) => p.identity === participantId);
    if (!participant) {
      throw new Error(
        `Participant ${participantId} not found in room ${roomName}`,
      );
    }


    const videoTrack = participant.tracks.find(
      (t) => t.type === TrackType.VIDEO && t.muted === false,
    );

    if (!videoTrack) {
      throw new Error(`No active video track for ${participantId}`);
    }



    return videoTrack.sid;
  }

  async startRecording(startRecordingDto: StartRecordingDto) {
    const { roomName, participantId, maxDuration = 60 } = startRecordingDto;



    try {

      const trackSid = await this.findScreenShareTrackId(
        roomName,
        participantId,
      );
      const filepath = `/records/${roomName}-${participantId}-${Date.now()}`;

      const s3Upload = new S3Upload({
        accessKey: process.env.S3_ACCESS_KEY,
        secret: process.env.S3_SECRET_KEY,
        region: process.env.S3_REGION,
        bucket: process.env.S3_BUCKET,
      });


      const res = await this.egressClient.startTrackEgress(
        roomName,
        new EncodedFileOutput({
          fileType: EncodedFileType.MP4,
          filepath,
          disableManifest: false,
          output: {
            value: s3Upload,
            case: 's3',
          },
        }),
        trackSid,
      );

      console.log('Screen share recording started:', res.egressId);

      setTimeout(() => {
        this.stopEgress(res.egressId);
      }, maxDuration * 1000);

      return { egressId: res.egressId, filepath, trackSid };
    } catch (error) {
      console.error('Failed to start screen share recording', error);
      throw error;
    }
  }


  async stopEgress(egressId: string) {
    try {
      const egressInfo = await this.egressClient.listEgress({ egressId });
      const egress = egressInfo.find((e) => e.egressId === egressId);

      if (!egress) {
        console.error('Egress not found:', egressId);
        return { message: 'Egress not found' };
      }

      console.log(
        'Egress status:',
        egress.status,
        '(',
        EgressStatus[egress.status],
        ')',
      );
      console.log('Egress error:', egress.error);
      console.log('File results:', egress.fileResults);

      if (egress.status === EgressStatus.EGRESS_ACTIVE) {
        await this.egressClient.stopEgress(egressId);
        console.log('Egress stopped');
        return { message: 'Egress stopped' };
      } else {
        console.log('Egress already in status:', egress.status);
        return {
          message: `Egress already in status: ${egress.status}`,
          status: egress.status,
          error: egress.error,
        };
      }
    } catch (error) {
      console.error('Failed to stop egress', error);
      return { error: error.message, status: 'failed' };
    }
  }
}
