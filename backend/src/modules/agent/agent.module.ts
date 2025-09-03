import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { RoomServiceClient } from 'livekit-server-sdk';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [
    AgentService,
    {
      provide: RoomServiceClient,
      useFactory: (configService: ConfigService) =>
        new RoomServiceClient(
          configService.get('LIVEKIT_URL')!,
          configService.get('LIVEKIT_API_KEY')!,
          configService.get('LIVEKIT_API_SECRET')!,
        ),
      inject: [ConfigService],
    },
  ],

  exports: [AgentService],
})
export class AgentModule {}
