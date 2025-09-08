import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class NodeDto {
  @IsString()
  id: string;

  @IsString()
  @IsEnum(['SpeechNode', 'DTMFNode'])
  type: string;

  @IsOptional()
  data: Record<string, any>;

  @IsOptional()
  @IsArray()
  edges: Array<{
    to: string;
    condition?: Record<string, any>;
  }>;
}
