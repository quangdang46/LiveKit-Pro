import { Node, AddChildFormSchema } from "@/types/node";
import { useForm, Controller } from "react-hook-form";
import { Editor } from "@monaco-editor/react";
import { ModeToggle } from "./ModeToggle";
import { zodResolver } from "@hookform/resolvers/zod";

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
      name: "",
      content: "",
      type: "BRANCH",
      status: "ACTIVE",
      jsonData: JSON.stringify(
        {
          name: "",
          content: "",
          type: "BRANCH",
          status: "ACTIVE",
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
                          fieldState.error
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter node name"
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
                      placeholder="Enter content"
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
                      <option value="BRANCH">BRANCH</option>
                      <option value="ROOT">ROOT</option>
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
      </div>
    </div>
  );
}
