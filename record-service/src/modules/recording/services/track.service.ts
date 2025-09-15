import { Injectable } from '@nestjs/common';
import { RoomServiceClient, TrackType } from 'livekit-server-sdk';

@Injectable()
export class TrackService {
  constructor(private readonly roomService: RoomServiceClient) {}

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
}
