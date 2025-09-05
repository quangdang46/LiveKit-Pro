import { Node, EditNodeFormSchema, EditNodeFormData } from "@/types/node";
import { useForm } from "react-hook-form";
import { ModeToggle } from "./ModeToggle";
import { zodResolver } from "@hookform/resolvers/zod";
import { BasicNodeFieldsForm } from "./BasicNodeFieldsForm";
import { JsonEditorForm } from "./JsonEditorForm";
import { Form } from "@/components/ui/form";
import { Button } from "./ui/button";

type EditNodeFormProps = {
  node: Node;
  mode: "form" | "json";
  onModeChange: (mode: "form" | "json") => void;
  onSave: (data: any) => void;
  onCancel: () => void;
};

export function EditNodeForm({
  node,
  mode,
  onModeChange,
  onSave,
  onCancel,
}: EditNodeFormProps) {
  const form = useForm({
    resolver: zodResolver(EditNodeFormSchema),
    defaultValues: {
      number: node.number,
      text: node.text,
      jsonData: JSON.stringify(
        {
          number: node.number,
          text: node.text,
        },
        null,
        2
      ),
    },
  });

  const handleSubmit = (data: EditNodeFormData) => {
    let finalData = data;
    if (mode === "json") {
      try {
        if (!data.jsonData) {
          alert("JSON data is required");
          return;
        }
        const parsedJson = JSON.parse(data.jsonData);
        const { success, data: validatedData } =
          EditNodeFormSchema.safeParse(parsedJson);
        if (success) {
          finalData = validatedData;
        } else {
          alert("Invalid JSON format");
          return;
        }
      } catch (error) {
        alert("Invalid JSON format");
        return;
      }
    }
    const { number, text } = finalData;
    onSave({ number, text });
  };

  return (
    <div className="edit-form border border-gray-300 p-3 rounded bg-gray-50 mt-2">
      <div className="mb-3 flex items-center justify-between">
        <strong>Edit Node {node.id}:</strong>
        <ModeToggle mode={mode} onModeChange={onModeChange} />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          {mode === "form" ? (
            <BasicNodeFieldsForm form={form} />
          ) : (
            <JsonEditorForm form={form} />
          )}
          <div className="flex gap-2">
            <Button
              type="submit"
              className="px-3 py-1.5 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
            >
              Save
            </Button>
            <Button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 bg-gray-500 text-white border-none rounded cursor-pointer hover:bg-gray-600"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
