import { Node, EditNodeFormSchema, EditNodeFormData } from "@/types/node";
import { useForm, Controller } from "react-hook-form";
import { Editor } from "@monaco-editor/react";
import { ModeToggle } from "./ModeToggle";
import { zodResolver } from "@hookform/resolvers/zod";

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
      name: node.name,
      content: node.content,
      type: node.type,
      status: node.status,
      jsonData: JSON.stringify(
        {
          name: node.name,
          content: node.content,
          type: node.type,
          status: node.status,
        },
        null,
        2
      ),
    },
  });

  const handleSubmit = (data: EditNodeFormData) => {
    let finalData = data;
    if (mode === "json") {
      const { success, data: parsedData } = EditNodeFormSchema.safeParse(data);
      if (success) {
        finalData = parsedData;
      } else {
        alert("Invalid JSON format");
        return;
      }
    }
    onSave(finalData);
  };

  return (
    <div className="edit-form border border-gray-300 p-3 rounded bg-gray-50 mt-2">
      <div className="mb-3 flex items-center justify-between">
        <strong>Edit Node {node.id}:</strong>
        <ModeToggle mode={mode} onModeChange={onModeChange} />
      </div>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        {mode === "form" ? (
          <>
            <div className="mb-2">
              <label className="block mb-1">Name: </label>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <>
                    <input
                      type="text"
                      {...field}
                      className={`p-1 rounded border w-full ${
                        fieldState.error ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-xs mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Content: </label>
              <Controller
                name="content"
                control={form.control}
                render={({ field }) => (
                  <textarea
                    {...field}
                    rows={2}
                    className="p-1 rounded border border-gray-300 w-full"
                  />
                )}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Type: </label>
              <Controller
                name="type"
                control={form.control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="p-1 rounded border border-gray-300 w-full"
                  >
                    <option value="ROOT">ROOT</option>
                    <option value="BRANCH">BRANCH</option>
                  </select>
                )}
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Status: </label>
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <select
                    {...field}
                    className="p-1 rounded border border-gray-300 w-full"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                )}
              />
            </div>
          </>
        ) : (
          <div className="mb-2">
            <label className="block mb-1">JSON Data: </label>
            <div className="border border-gray-300 rounded">
              <Controller
                name="jsonData"
                control={form.control}
                render={({ field }) => (
                  <Editor
                    height="200px"
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
                )}
              />
            </div>
          </div>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
          >
            Save
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
    </div>
  );
}
