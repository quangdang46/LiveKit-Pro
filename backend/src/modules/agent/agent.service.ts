import { Injectable } from '@nestjs/common';

import { AccessToken, RoomServiceClient, VideoGrant } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AgentService {
  constructor(
    private readonly configService: ConfigService,
    private readonly roomServiceClient: RoomServiceClient,
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
}
