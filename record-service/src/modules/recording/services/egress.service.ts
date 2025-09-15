import { Injectable } from '@nestjs/common';
import {
  EgressClient,
  EgressStatus,
  EncodedFileOutput,
  EncodedFileType,
  S3Upload,
} from 'livekit-server-sdk';

export type StartEgressRequest = {
  roomName: string;
  trackSid: string;
  filepath: string;
  s3Upload: S3Upload;
};

export type EgressResult = {
  egressId: string;
  filepath: string;
  trackSid: string;
};

@Injectable()
export class EgressService {
  constructor(private readonly egressClient: EgressClient) {}

  async startTrackEgress(request: StartEgressRequest): Promise<EgressResult> {
    const { roomName, trackSid, filepath, s3Upload } = request;

    const response = await this.egressClient.startTrackEgress(
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

    return {
      egressId: response.egressId,
      filepath,
      trackSid,
    };
  }

  async stopEgress(egressId: string): Promise<{
    message: string;
    status?: EgressStatus;
    error?: string;
  }> {
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
      return { error: error.message, message: 'Failed to stop egress' };
    }
  }
}
