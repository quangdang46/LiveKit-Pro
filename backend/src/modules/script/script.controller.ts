import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  Patch,
  Get,
} from '@nestjs/common';
import { ScriptService } from 'src/modules/script/script.service';
import { CreateScriptDto } from 'src/modules/script/dto/create-script.dto';
import { UpdateScriptDto } from 'src/modules/script/dto/update-script.dto';
import { ValidateScriptDto } from 'src/modules/script/dto/validate-script.dto';
import type { ScriptData } from './schema/script.entity';

@Controller('script')
export class ScriptController {
  constructor(private readonly service: ScriptService) {}

  @Post()
  async create(@Body() createDto: CreateScriptDto) {
    const validation = this.service.validateScript(createDto.scriptData);
    if (!validation.valid) {
      throw new Error(`Script validation failed: ${validation.error}`);
    }

    return this.service.create(createDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateScriptDto) {
    if (updateDto.scriptData) {
      const validation = this.service.validateScript(updateDto.scriptData);
      if (!validation.valid) {
        throw new Error(`Script validation failed: ${validation.error}`);
      }
    }

    return await this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('validate')
  async validateScript(@Body() validateDto: ValidateScriptDto) {
    return this.service.validateScript(validateDto.scriptData);
  }
}
