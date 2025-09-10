import { Injectable } from '@nestjs/common';
import {
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  RoomServiceClient,
  TrackType,
} from 'livekit-server-sdk';
import { StartRecordingDto } from './dto/start-recording.dto';

@Injectable()
export class RecordingService {
  constructor(
    private readonly egressClient: EgressClient,
    private readonly roomService: RoomServiceClient,
  ) {}

  async findAudioTrackId(
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

    const audioTrack = participant.tracks.find(
      (t) => t.type === TrackType.AUDIO && t.muted === false,
    );

    if (!audioTrack) {
      throw new Error(`No active audio track for ${participantId}`);
    }

    console.log('Track:', {
      sid: audioTrack.sid,
      type: audioTrack.type,
      muted: audioTrack.muted,
      name: audioTrack.name,
    });

    return audioTrack.sid;
  }

  async startRecording(startRecordingDto: StartRecordingDto) {
    const { roomName, participantId, maxDuration = 60 } = startRecordingDto;

    console.log('Request:', {
      roomName,
      participantId,
      maxDuration,
    });

    try {
      const audioTrackId = await this.findAudioTrackId(roomName, participantId);
      const filepath = `/records/${roomName}-${Date.now()}.ogg`;

      const res = await this.egressClient.startTrackEgress(
        roomName,
        new EncodedFileOutput({
          fileType: EncodedFileType.OGG,
          filepath: filepath,
        }),
        audioTrackId,
      );

      setTimeout(async () => {
        try {
          await this.egressClient.stopEgress(res.egressId);
        } catch (error) {
          console.error(`Failed to stop recording: ${res.egressId}`, error);
        }
      }, maxDuration * 1000);

      return { egressId: res.egressId };
    } catch (error) {
      throw error;
    }
  }

  async stopEgress(egressId: string) {
    console.log('Stopping recording:', egressId);

    try {
      await this.egressClient.stopEgress(egressId);
      return { message: 'Egress stopped' };
    } catch (error) {
      throw new Error('Failed to stop egress');
    }
  }
}
