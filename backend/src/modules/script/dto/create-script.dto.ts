import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ScriptDataSchema } from 'src/modules/script/schema/script.entity';
import { NodeDto } from './node.dto';
import { z } from 'zod';

export class CreateScriptDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  scriptData: z.infer<typeof ScriptDataSchema>;

  @IsOptional()
  @IsString()
  version?: string;
}
