import { IsString, IsNotEmpty } from 'class-validator';

export class CreateCallDto {
  @IsString()
  @IsNotEmpty()
  callSid: string;

  @IsString()
  @IsNotEmpty()
  roomName: string;
}
