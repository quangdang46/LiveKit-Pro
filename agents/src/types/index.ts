import { z } from "zod";
import { ROOT_NODE_ID } from "../constant";

export const TypeNodeSchema = z.enum(["DTMFNode", "SpeechNode"]);

export const EdgeConditionSchema = z.object({
  key: z.string(),
});

export const EdgeSchema = z.object({
  to: z.string(),
  condition: EdgeConditionSchema.optional(),
});

export const BaseNodeSchema = z.object({
  id: z.string().min(1, "Node ID is required"),
  type: TypeNodeSchema,
  edges: z.array(EdgeSchema).default([]),
});

export const SpeechNodeDataSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

export const DTMFNodeDataSchema = z.object({
  prompt: z.string().min(1, "Prompt is required"),
  options: z.array(z.string()).min(1, "At least one option is required"),
});

export const SpeechNodeSchema = BaseNodeSchema.extend({
  type: z.literal("SpeechNode"),
  data: SpeechNodeDataSchema,
});

export const DTMFNodeSchema = BaseNodeSchema.extend({
  type: z.literal("DTMFNode"),
  data: DTMFNodeDataSchema,
});

export const NodeSchema = z.discriminatedUnion("type", [
  SpeechNodeSchema,
  DTMFNodeSchema,
]);

export const ScriptSchema = z
  .object({
    id: z.string().min(1, "Script ID is required"),
    name: z.string().min(1, "Script name is required"),
    description: z.string().optional(),
    scriptData: z.array(NodeSchema).min(1, "At least one node is required"),
  })
  .refine(
    (data) => {
      return data.scriptData.some((node) => node.id === ROOT_NODE_ID);
    },
    {
      message: "Root node ID must reference an existing node",
    }
  )
  .refine(
    (data) => {
      const nodeIds = new Set(data.scriptData.map((node) => node.id));
      for (const node of data.scriptData) {
        for (const edge of node.edges) {
          if (!nodeIds.has(edge.to)) {
            return false;
          }
        }
      }
      return true;
    },
    {
      message: "All edge destinations must reference existing nodes",
    }
  );

export type NodeType = z.infer<typeof TypeNodeSchema>;
export type EdgeCondition = z.infer<typeof EdgeConditionSchema>;
export type Edge = z.infer<typeof EdgeSchema>;
export type SpeechNode = z.infer<typeof SpeechNodeSchema>;
export type DTMFNode = z.infer<typeof DTMFNodeSchema>;
export type Script = z.infer<typeof ScriptSchema>;
export type Node = z.infer<typeof NodeSchema>;

export const validateScript = (script: unknown) => {
  return ScriptSchema.safeParse(script);
};

export type Metadata = {
  scriptId: string;
};

export type MessageData = {
  type: string;
  digit?: string;
  [key: string]: any;
};
