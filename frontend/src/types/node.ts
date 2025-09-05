import { z } from "zod";

export const NodeTypeSchema = z.enum(["ROOT", "BRANCH"]);
export const NodeStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export type NodeType = z.infer<typeof NodeTypeSchema>;
export type NodeStatus = z.infer<typeof NodeStatusSchema>;

export const NodeSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: NodeTypeSchema,
  content: z.string(),
  status: NodeStatusSchema,
  get children() {
    return z.array(NodeSchema);
  },
  jsonData: z.string().optional(),
});

export type Node = z.infer<typeof NodeSchema>;

export const EditNodeFormSchema = NodeSchema.omit({ children: true, id: true });

export type EditNodeFormData = z.infer<typeof EditNodeFormSchema>;

export const AddChildFormSchema = EditNodeFormSchema;

export type AddChildFormData = z.infer<typeof AddChildFormSchema>;
