import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { NodeType } from "@/types/node";

type BasicNodeFieldsFormProps = {
  form: UseFormReturn<any>;
};

const isDTMF = (type: NodeType) => type === "DTMFNode";

export function BasicNodeFieldsForm({ form }: BasicNodeFieldsFormProps) {
  const type = (form.watch("type") as NodeType) || "SpeechNode";

  return (
    <>
      <FormField
        control={form.control as any}
        name={"type" as any}
        render={({ field }) => (
          <FormItem className="mb-2">
            <FormLabel>Type</FormLabel>
            <FormControl>
              <select
                {...field}
                className="border rounded px-2 py-1"
                onChange={(e) => {
                  const nextType = e.target.value as NodeType;
                  field.onChange(nextType);
                  if (nextType === "SpeechNode") {
                    form.setValue("data", { message: "" });
                  } else {
                    form.setValue("data", { prompt: "", options: [] });
                  }
                }}
              >
                <option value="SpeechNode">SpeechNode</option>
                <option value="DTMFNode">DTMFNode</option>
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {type === "SpeechNode" && (
        <FormField
          control={form.control as any}
          name={"data.message" as any}
          render={({ field }) => (
            <FormItem className="mb-2">
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Input type="text" {...field} placeholder="Enter message" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {isDTMF(type) && (
        <>
          <FormField
            control={form.control as any}
            name={"data.prompt" as any}
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Input type="text" {...field} placeholder="Enter prompt" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control as any}
            name={"data.options" as any}
            render={({ field }) => (
              <FormItem className="mb-2">
                <FormLabel>Options (comma-separated)</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    value={(field.value || []).join(",")}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value
                          .split(",")
                          .map((s) => s.trim())
                          .filter(Boolean)
                      )
                    }
                    placeholder="e.g. 1,2,3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
}
