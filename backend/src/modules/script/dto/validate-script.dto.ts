import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { NodeDto } from './node.dto';

export class ValidateScriptDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NodeDto)
  scriptData: any[];
}
