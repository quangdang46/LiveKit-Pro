import { Injectable } from '@nestjs/common';
import {
  DirectFileOutput,
  EgressClient,
  EncodedFileOutput,
  EncodedFileType,
  EncodedOutputs,
  RoomServiceClient,
  S3Upload,
  SegmentedFileOutput,
  TrackType,
} from 'livekit-server-sdk';
import { StartRecordingDto } from './dto/start-recording.dto';
import {
  BinaryReadOptions,
  BinaryWriteOptions,
} from 'node_modules/@bufbuild/protobuf/dist/cjs/binary-format';
import {
  JsonValue,
  JsonReadOptions,
  JsonWriteOptions,
  JsonWriteStringOptions,
} from 'node_modules/@bufbuild/protobuf/dist/cjs/json-format';
import { PlainMessage } from 'node_modules/@bufbuild/protobuf/dist/cjs/message';
import { MessageType } from 'node_modules/@bufbuild/protobuf/dist/cjs/message-type';

@Injectable()
export class RecordingService {
  constructor(
    private readonly egressClient: EgressClient,
    private readonly roomService: RoomServiceClient,
  ) {}

  async findVideoTrackId(
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

    console.log('Participant:', {
      identity: participant.identity,
      trackCount: participant.tracks?.length,
      tracks: participant.tracks?.map((t) => ({
        sid: t.sid,
        type: t.type,
        muted: t.muted,
        name: t.name,
      })),
    });
    const audioTrack = participant.tracks.find(
      (t) => t.type === TrackType.VIDEO && t.muted === false,
    );

    if (!audioTrack) {
      throw new Error(`No active video track for ${participantId}`);
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

    console.log('StartRecording Request:', {
      roomName,
      participantId,
      maxDuration,
    });

    try {
      const filepath = `/records/${roomName}-${Date.now()}.mp4`;

      const res = await this.egressClient.startRoomCompositeEgress(
        roomName,
        new EncodedFileOutput({
          fileType: EncodedFileType.MP4,
          filepath,
          disableManifest: false,
          output: {
            value: new S3Upload(),
            case: 's3',
          },
        }),
      );

      console.log('Egress started:', res.egressId);
      setTimeout(() => {
        this.stopEgress(res.egressId);
      }, maxDuration * 1000);

      return { egressId: res.egressId, filepath };
    } catch (error) {
      console.error('Failed to start recording', error);
      throw error;
    }
  }

  async stopEgress(egressId: string) {
    try {
      await this.egressClient.stopEgress(egressId);
      return { message: 'Egress stopped' };
    } catch (error) {
      console.error('Failed to stop egress', error);
    }
  }
}
