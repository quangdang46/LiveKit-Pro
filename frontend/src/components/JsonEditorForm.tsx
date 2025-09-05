import { UseFormReturn } from "react-hook-form";
import { Editor } from "@monaco-editor/react";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type JsonEditorFormProps<FormType extends { jsonData?: string }> = {
  form: UseFormReturn<FormType>;
  height?: string;
};

export function JsonEditorForm<FormType extends { jsonData?: string }>({
  form,
  height = "100px",
}: JsonEditorFormProps<FormType>) {
  return (
    <FormField
      control={form.control as any}
      name={"jsonData" as any}
      render={({ field }) => (
        <FormItem className="mb-2">
          <FormLabel>JSON Data</FormLabel>
          <FormControl>
            <div className="border border-gray-300 rounded">
              <Editor
                height={height}
                language="json"
                value={field.value}
                onChange={field.onChange}
                theme="vs-light"
                options={{
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
