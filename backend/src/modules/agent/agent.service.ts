import { Injectable } from '@nestjs/common';

import { AccessToken, RoomServiceClient, VideoGrant } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly roomServiceClient: RoomServiceClient,
  ) {}

  async createAccessToken(roomName: string, participantName: string) {
    const at = new AccessToken(
      this.configService.get('LIVEKIT_API_KEY')!,
      this.configService.get('LIVEKIT_API_SECRET')!,
      {
        identity: participantName,
      },
    );
    const videoGrant: VideoGrant = {
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    };
    at.addGrant(videoGrant);
    const token = await at.toJwt();
    console.log('access token', token);
    return token;
  }

  async handleNewCall(callSid: string, roomName: string) {
    try {
      const botName = `${callSid}-bot`;
      const token = await this.createAccessToken(roomName, botName);

      console.log(`Agent ready for room: ${roomName}`);
      console.log(`Call SID: ${callSid}`);
      console.log(`Bot identity: ${botName}`);

      const rooms = await this.roomServiceClient.listRooms();
      const roomInfo = rooms.find((r) => r.name === roomName);

      if (!roomInfo) {
        throw new Error(`Room ${roomName} not found`);
      } else {
        console.log(`Current participants:`);
        roomInfo.metadata.split(',').forEach((p) => {
          console.log(`- ${p}`);
        });
      }

      console.log(`Agent is listening for events in the room...`);

      return {
        token,
        roomName,
        botName,
      };
    } catch (err) {
      throw new Error(err);
    }
  }
}
