import { Module } from '@nestjs/common';
import { LivekitController } from './livekit.controller';
import { LivekitService } from './livekit.service';
import { AgentModule } from '../agent/agent.module';

@Module({
  controllers: [LivekitController],
  providers: [LivekitService],
  imports: [AgentModule],
})
export class LivekitModule {}
