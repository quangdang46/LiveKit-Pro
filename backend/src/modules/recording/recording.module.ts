import { Module } from '@nestjs/common';
import { RecordingService } from './recording.service';
import { RecordingController } from './recording.controller';
import { AgentModule } from '../agent/agent.module';
@Module({
  providers: [RecordingService],

  exports: [RecordingService],

  controllers: [RecordingController],
  imports: [AgentModule],
})
export class RecordingModule {}
