import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class StartRecordingDto {
  @IsString()
  roomName: string;

  @IsString()
  participantId: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxDuration?: number;
}
