import { Module, Provider } from '@nestjs/common';
import { RecordingService } from './recording.service';
import { RecordingController } from './recording.controller';
import { TrackService } from './services/track.service';
import { EgressService } from './services/egress.service';
import { LiveKitConfigService } from '../../config/livekit.config';
import { S3ConfigService } from '../../config/s3.config';
import { EgressClient, RoomServiceClient } from 'livekit-server-sdk';

const PROVIDERS: Provider[] = [
  RecordingService,
  TrackService,
  EgressService,
  LiveKitConfigService,
  S3ConfigService,
  {
    provide: RoomServiceClient,
    useFactory: (liveKitConfigService: LiveKitConfigService) =>
      liveKitConfigService.createRoomServiceClient(),
    inject: [LiveKitConfigService],
  },
  {
    provide: EgressClient,
    useFactory: (liveKitConfigService: LiveKitConfigService) =>
      liveKitConfigService.createEgressClient(),
    inject: [LiveKitConfigService],
  },
];

@Module({
  providers: [...PROVIDERS],

  exports: [RecordingService],

  controllers: [RecordingController],
  imports: [],
})
export class RecordingModule {}
