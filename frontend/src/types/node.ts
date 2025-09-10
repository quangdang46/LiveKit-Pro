import { z } from "zod";

export const NodeTypeSchema = z.enum([
  "SpeechNode",
  "DTMFNode",
  "RecordingNode",
]);
export type NodeType = z.infer<typeof NodeTypeSchema>;

export const EdgeSchema = z.object({
  to: z.string().min(1, "Target node ID is required"),
  condition: z
    .object({
      key: z.string().min(1, "Condition key is required"),
    })
    .optional(),
});

const SpeechNodeDataSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message too long"),
});
const RecordingNodeDataSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Message too long"),
});

const DTMFNodeDataSchema = z.object({
  prompt: z.string().min(1, "Prompt is required").max(200, "Prompt too long"),
  options: z
    .array(z.string().min(1, "Option cannot be empty"))
    .min(1, "At least one option is required")
    .max(10, "Too many options"),
});

export const NodeSchema = z.object({
  id: z.string().min(1, "Node ID is required"),
  type: NodeTypeSchema,
  data: z.union([
    SpeechNodeDataSchema,
    DTMFNodeDataSchema,
    RecordingNodeDataSchema,
  ]),
  edges: z.array(EdgeSchema),
});

export type Node = z.infer<typeof NodeSchema>;

export const EditNodeFormSchema = z.object({
  type: NodeTypeSchema,
  data: z.any(),
  scriptData: z.string().optional(),
});

export type EditNodeFormData = z.infer<typeof EditNodeFormSchema>;

export const AddChildFormSchema = EditNodeFormSchema;

export const ScriptSchema = z.object({
  name: z.string().min(1, "Script name is required"),
  description: z.string().min(1, "Description is required"),
  scriptData: z.array(NodeSchema),
});

export type Script = z.infer<typeof ScriptSchema>;

export type ScriptResponse = Script & { id: string };

export type ScriptsListResponse = ScriptResponse[];

export type CreateScriptRequest = Script;
export type UpdateScriptRequest = {
  name?: string;
  description?: string;
  scriptData?: Node[];
};
