import { Controller, Post, Body } from '@nestjs/common';
import { RecordingService } from './recording.service';
import { StartRecordingDto } from './dto/start-recording.dto';
import { StopRecordingDto } from './dto/stop-recording.dto';

@Controller('recording')
export class RecordingController {
  constructor(private readonly recordingService: RecordingService) {}

  @Post('start')
  async startRecording(@Body() startRecordingDto: StartRecordingDto) {
    try {
      const result =
        await this.recordingService.startRecording(startRecordingDto);
      console.log('Recording successfully:', result);
      return result;
    } catch (error) {
      console.error('Failed to start recording:', error);
      throw error;
    }
  }

  @Post('stop')
  stopEgress(@Body() stopEgressDto: StopRecordingDto) {
    return this.recordingService.stopEgress(stopEgressDto.egressId);
  }
}
