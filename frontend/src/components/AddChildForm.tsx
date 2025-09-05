import { AddChildFormSchema } from "@/types/node";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BasicNodeFieldsForm } from "./BasicNodeFieldsForm";
import { JsonEditorForm } from "./JsonEditorForm";
import { ModeToggle } from "./ModeToggle";

interface AddChildFormProps {
  level: number;
  mode: "form" | "json";
  onModeChange: (mode: "form" | "json") => void;
  onAdd: (data: any) => void;
  onCancel: () => void;
}

export function AddChildForm({
  level,
  mode,
  onModeChange,
  onAdd,
  onCancel,
}: AddChildFormProps) {
  const form = useForm({
    resolver: zodResolver(AddChildFormSchema),
    defaultValues: {
      number: 0,
      text: "",
      jsonData: JSON.stringify(
        {
          number: 0,
          text: "",
        },
        null,
        2
      ),
    },
  });

  const handleSubmit = (data: any) => {
    let finalData = data;
    if (mode === "json") {
      try {
        finalData = JSON.parse(data.jsonData);
      } catch (error) {
        alert("Invalid JSON format");
        return;
      }
    }
    onAdd(finalData);
  };

  return (
    <div style={{ paddingLeft: `${(level + 1) * 20}px` }} className="mt-2">
      <div className="add-child-form border border-blue-500 p-3 rounded bg-blue-50 mb-2">
        <div className="mb-3 flex items-center justify-between">
          <strong>Add New Child Node:</strong>
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
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
              >
                Add
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-3 py-1.5 bg-gray-500 text-white border-none rounded cursor-pointer hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
