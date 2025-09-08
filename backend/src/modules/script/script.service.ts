import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as schema from './schema/script.entity';
import { CreateScriptDto } from 'src/modules/script/dto/create-script.dto';
import { desc, eq } from 'drizzle-orm';
import { UpdateScriptDto } from 'src/modules/script/dto/update-script.dto';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

@Injectable()
export class ScriptService {
  constructor(
    @Inject('SCRIPT_TOKEN')
    private readonly script: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(createDto: CreateScriptDto) {
    const validation = this.validateScript(createDto.scriptData);
    if (!validation.valid) {
      throw new Error(`Invalid script data: ${validation.error}`);
    }

    const [newScript] = await this.script
      .insert(schema.Scripts)
      .values({
        name: createDto.name,
        description: createDto.description,
        scriptData: createDto.scriptData,
      })
      .returning();

    return newScript;
  }

  async findAll() {
    return await this.script
      .select()
      .from(schema.Scripts)
      .orderBy(desc(schema.Scripts.updatedAt));
  }

  async findOne(id: string) {
    const [script] = await this.script
      .select()
      .from(schema.Scripts)
      .where(eq(schema.Scripts.id, id));

    if (!script) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }

    return script;
  }

  async update(id: string, updateDto: UpdateScriptDto) {
    const [updatedScript] = await this.script
      .update(schema.Scripts)
      .set({
        ...updateDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.Scripts.id, id))
      .returning();

    if (!updatedScript) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }

    return updatedScript;
  }

  async remove(id: string) {
    const [deletedScript] = await this.script
      .delete(schema.Scripts)
      .where(eq(schema.Scripts.id, id))
      .returning();

    if (!deletedScript) {
      throw new NotFoundException(`Script with ID ${id} not found`);
    }

    return { message: 'Script deleted successfully' };
  }

  validateScript(scriptData: schema.ScriptData) {
    try {
      schema.ScriptDataSchema.parse(scriptData);

      const nodeIds = new Set(scriptData.map((node) => node.id));

      for (const node of scriptData) {
        for (const edge of node.edges || []) {
          if (!nodeIds.has(edge.to)) {
            throw new Error(`Edge destination "${edge.to}" does not exist`);
          }
        }
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
