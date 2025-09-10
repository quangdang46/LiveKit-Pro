import { Module, Provider } from '@nestjs/common';
import { AgentService } from './agent.service';
import {
  AgentDispatchClient,
  EgressClient,
  RoomServiceClient,
  WebhookReceiver,
} from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';
import { ScriptModule } from '../script/script.module';

interface LiveKitConfig {
  apiKey: string;
  apiSecret: string;
  url?: string;
}

const getLiveKitConfig = (configService: ConfigService): LiveKitConfig => {
  const apiKey = configService.get<string>('LIVEKIT_API_KEY');
  const apiSecret = configService.get<string>('LIVEKIT_API_SECRET');
  const url = configService.get<string>('LIVEKIT_URL');

  if (!apiKey || !apiSecret || !url) {
    throw new Error(
      'Missing required LiveKit configuration: LIVEKIT_API_KEY and LIVEKIT_API_SECRET and LIVEKIT_URL_AUDIO and LIVEKIT_URL',
    );
  }

  return { apiKey, apiSecret, url };
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

const createRoomServiceClient = (
  configService: ConfigService,
): RoomServiceClient => {
  const { apiKey, apiSecret, url } = getLiveKitConfig(configService);
  if (!url) {
    throw new Error('Missing required LiveKit configuration: LIVEKIT_URL');
  }
  return new RoomServiceClient(url, apiKey, apiSecret);
};

const createEgressClient = (configService: ConfigService): EgressClient => {
  const { apiKey, apiSecret, url } = getLiveKitConfig(configService);
  return new EgressClient(url!, apiKey, apiSecret);
};

const PROVIDERS: Provider[] = [
  AgentService,
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
  {
    provide: RoomServiceClient,
    useFactory: createRoomServiceClient,
    inject: [ConfigService],
  },
  {
    provide: EgressClient,
    useFactory: createEgressClient,
    inject: [ConfigService],
  },
];

@Module({
  imports: [ScriptModule],
  providers: [...PROVIDERS],
  exports: [
    AgentService,
    AgentDispatchClient,
    WebhookReceiver,
    RoomServiceClient,
    EgressClient,
  ],
})
export class AgentModule {}
