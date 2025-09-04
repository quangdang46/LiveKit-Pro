import { Injectable } from '@nestjs/common';

import {
  AccessToken,
  AgentDispatchClient,
  Room,
  RoomServiceClient,
  VideoGrant,
} from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly roomServiceClient: RoomServiceClient,
    private readonly agentDispatchClient: AgentDispatchClient,
  ) {}

  async createAccessToken(room: string, participantName: string) {
    const at = new AccessToken(
      this.configService.get<string>('LIVEKIT_API_KEY'),
      this.configService.get<string>('LIVEKIT_API_SECRET'),
      {
        identity: participantName,
      },
    );
    const videoGrant: VideoGrant = {
      room,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    };
    at.addGrant(videoGrant);
    const token = await at.toJwt();
    console.log('access token', token);
    return token;
  }

  async createRoom(roomName: string): Promise<Room> {
    try {
      const room = await this.roomServiceClient.createRoom({
        name: roomName,
        emptyTimeout: 300,
        maxParticipants: 10,
      });

      console.log(`Room created: ${roomName}`);
      return room;
    } catch (error) {
      console.error(`Failed to create room: ${error.message}`);
      throw error;
    }
  }

  async dispatchAgent(roomName: string, agentName: string) {
    try {
      const dispatch = await this.agentDispatchClient.createDispatch(
        roomName,
        agentName,
        {
          metadata: '{"user_id": "12345"}',
        },
      );
      console.log('created dispatch', dispatch);

      return dispatch;
    } catch (error) {
      throw error;
    }
  }
}
