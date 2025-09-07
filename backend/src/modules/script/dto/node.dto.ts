import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { NodeSchema } from 'src/modules/script/schema/script.entity';

export class NodeDto {
  @IsString()
  id: string;

  @IsString()
  @IsEnum(NodeSchema.shape.type)
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
