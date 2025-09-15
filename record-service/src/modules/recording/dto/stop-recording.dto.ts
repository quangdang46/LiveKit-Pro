import { IsString } from 'class-validator';

export class StopRecordingDto {
  @IsString()
  egressId: string;
}
