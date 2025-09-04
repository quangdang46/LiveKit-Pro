import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import {
  AgentDispatchClient,
  RoomServiceClient,
  WebhookReceiver,
} from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    AgentService,
    {
      provide: RoomServiceClient,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('LIVEKIT_API_KEY')!;
        const apiSecret = configService.get<string>('LIVEKIT_API_SECRET')!;
        return new RoomServiceClient(apiKey, apiSecret);
      },
      inject: [ConfigService],
    },
    {
      provide: AgentDispatchClient,
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('LIVEKIT_URL')!;
        const apiKey = configService.get<string>('LIVEKIT_API_KEY')!;
        const apiSecret = configService.get<string>('LIVEKIT_API_SECRET')!;
        return new AgentDispatchClient(url, apiKey, apiSecret);
      },
      inject: [ConfigService],
    },

    {
      provide: WebhookReceiver,
      useFactory: (configService: ConfigService) => {
        const apiKey = configService.get<string>('LIVEKIT_API_KEY')!;
        const apiSecret = configService.get<string>('LIVEKIT_API_SECRET')!;
        return new WebhookReceiver(apiKey, apiSecret);
      },
      inject: [ConfigService],
    },
  ],

  exports: [AgentService],
})
export class AgentModule {}
