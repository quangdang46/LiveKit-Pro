import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { RoomServiceClient } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    AgentService,
    {
      provide: RoomServiceClient,
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('LIVEKIT_URL')!;
        const apiKey = configService.get<string>('LIVEKIT_API_KEY')!;
        const apiSecret = configService.get<string>('LIVEKIT_API_SECRET')!;
        return new RoomServiceClient(url, apiKey, apiSecret);
      },
      inject: [ConfigService],
    },
  ],

  exports: [AgentService],
})
export class AgentModule {}
