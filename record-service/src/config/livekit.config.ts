import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EgressClient, RoomServiceClient } from 'livekit-server-sdk';

export type LiveKitConfig = {
  apiKey: string;
  apiSecret: string;
  url: string;
};

@Injectable()
export class LiveKitConfigService {
  constructor(private readonly configService: ConfigService) {}

  getConfig(): LiveKitConfig {
    const apiKey = this.configService.get<string>('LIVEKIT_API_KEY');
    const apiSecret = this.configService.get<string>('LIVEKIT_API_SECRET');
    const url = this.configService.get<string>('LIVEKIT_URL');

    if (!apiKey || !apiSecret || !url) {
      throw new Error(
        'Missing required LiveKit configuration: LIVEKIT_API_KEY, LIVEKIT_API_SECRET, and LIVEKIT_URL',
      );
    }

    return { apiKey, apiSecret, url };
  }

  createRoomServiceClient(): RoomServiceClient {
    const { apiKey, apiSecret, url } = this.getConfig();
    return new RoomServiceClient(url, apiKey, apiSecret);
  }

  createEgressClient(): EgressClient {
    const { apiKey, apiSecret, url } = this.getConfig();
    return new EgressClient(url, apiKey, apiSecret);
  }
}
