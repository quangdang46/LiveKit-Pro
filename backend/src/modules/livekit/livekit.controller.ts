import {
  Controller,
  Get,
  Post,
  Body,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { AgentService } from '../agent/agent.service';
import { CreateCallDto } from './dto/new-call.dto';

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

  @Post('/create-room')
  async createRoom(@Body() body: CreateCallDto) {
    try {
      return await this.agent.handleNewCall(body.callSid, body.roomName);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
