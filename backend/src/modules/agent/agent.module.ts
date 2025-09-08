import { Module, Provider } from '@nestjs/common';
import { AgentService } from './agent.service';
import {
  AgentDispatchClient,
  RoomServiceClient,
  WebhookReceiver,
} from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

interface LiveKitConfig {
  apiKey: string;
  apiSecret: string;
  url?: string;
}

const getLiveKitConfig = (configService: ConfigService): LiveKitConfig => {
  const apiKey = configService.get<string>('LIVEKIT_API_KEY');
  const apiSecret = configService.get<string>('LIVEKIT_API_SECRET');
  const url = configService.get<string>('LIVEKIT_URL');

  if (!apiKey || !apiSecret) {
    throw new Error(
      'Missing required LiveKit configuration: LIVEKIT_API_KEY and LIVEKIT_API_SECRET',
    );
  }

  return { apiKey, apiSecret, url };
};

const createRoomServiceClient = (
  configService: ConfigService,
): RoomServiceClient => {
  const { apiKey, apiSecret } = getLiveKitConfig(configService);
  return new RoomServiceClient(apiKey, apiSecret);
};

const createAgentDispatchClient = (
  configService: ConfigService,
): AgentDispatchClient => {
  const { url, apiKey, apiSecret } = getLiveKitConfig(configService);
  if (!url) {
    throw new Error('Missing required LiveKit configuration: LIVEKIT_URL');
  }
  return new AgentDispatchClient(url, apiKey, apiSecret);
};

const createWebhookReceiver = (
  configService: ConfigService,
): WebhookReceiver => {
  const { apiKey, apiSecret } = getLiveKitConfig(configService);
  return new WebhookReceiver(apiKey, apiSecret);
};

const PROVIDERS: Provider[] = [
  AgentService,
  {
    provide: RoomServiceClient,
    useFactory: createRoomServiceClient,
    inject: [ConfigService],
  },
  {
    provide: AgentDispatchClient,
    useFactory: createAgentDispatchClient,
    inject: [ConfigService],
  },
  {
    provide: WebhookReceiver,
    useFactory: createWebhookReceiver,
    inject: [ConfigService],
  },
];

@Module({
  providers: [...PROVIDERS],
  exports: [
    AgentService,
    RoomServiceClient,
    AgentDispatchClient,
    WebhookReceiver,
  ],
})
export class AgentModule {}
