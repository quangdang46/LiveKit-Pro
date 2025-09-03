import { Controller, Get, Query } from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { AgentService } from '../agent/agent.service';

@Controller('livekit')
export class LivekitController {
  constructor(
    private readonly livekit: LivekitService,
    private readonly agent: AgentService,
  ) {}

  @Get('/test')
  test() {
    return { message: 'Hello World' };
  }

  @Get('token')
  async getToken(
    @Query('roomName') room: string,
    @Query('userName') userName: string,
  ) {
    const token = await this.agent.createAccessToken(room, userName);
    return { token };
  }
}
