import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
} from '@nestjs/common';
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

  @Post('session')
  async createSession(@Body() body: { userName: string }) {
    try {
      if (!body.userName?.trim()) {
        return {
          success: false,
          error: 'userName is required and cannot be empty',
        };
      }

      const session = await this.agent.createSession(body.userName);

      return {
        success: true,
        ...session,
      };
    } catch (error) {
      console.error('Session creation failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to create session',
      };
    }
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: any,
    @Headers('authorization') authHeader: string,
  ) {
    return this.agent.webhook(req, authHeader);
  }
}
