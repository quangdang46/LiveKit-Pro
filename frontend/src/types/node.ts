import { z } from "zod";

export const NodeSchema = z.object({
  id: z.string(),
  number: z.number(),
  text: z.string(),
  parentId: z.string(),
});

export type Node = z.infer<typeof NodeSchema>;

export const EditNodeFormSchema = z.object({
  number: z.coerce.number(),
  text: z.string().min(1),
  jsonData: z.string().optional(),
});

export type EditNodeFormData = z.infer<typeof EditNodeFormSchema>;

export const AddChildFormSchema = EditNodeFormSchema;
