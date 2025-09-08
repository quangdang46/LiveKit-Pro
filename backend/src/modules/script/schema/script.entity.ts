import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
} from 'drizzle-orm/pg-core';
import { z } from 'zod';

export const SpeechNodeSchema = z.object({
  message: z.string(),
});

export const DTMFNodeSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()),
});

export const NodeSchema = z.object({
  id: z.string(),
  type: z.enum(['SpeechNode', 'DTMFNode']),
  data: z.union([SpeechNodeSchema, DTMFNodeSchema]),
  edges: z
    .array(
      z.object({
        to: z.string(),
        condition: z.record(z.any()).optional(),
      }),
    )
    .default([]),
});

export const ScriptDataSchema = z.array(NodeSchema);

export const Scripts = pgTable('scripts', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  scriptData: jsonb('script_data').$type<ScriptData>().notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export type Script = typeof Scripts.$inferSelect;
export type NewScript = typeof Scripts.$inferInsert;
export type ScriptData = z.infer<typeof ScriptDataSchema>;
