"use client";
import { useEffect, useMemo, useState } from "react";
import { Editor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Node, NodeSchema } from "@/types/node";

type NodesJsonEditorProps = {
  nodes: Node[];
  onApply: (nodes: Node[]) => void;
};

const useArraySchema = () => useMemo(() => z.array(NodeSchema), []);

export function NodesJsonEditor({ nodes, onApply }: NodesJsonEditorProps) {
  const [jsonDraft, setJsonDraft] = useState<string>(
    JSON.stringify(nodes, null, 2)
  );
  const ArraySchema = useArraySchema();

  useEffect(() => {
    setJsonDraft(JSON.stringify(nodes, null, 2));
  }, [nodes]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonDraft);
      const result = ArraySchema.safeParse(parsed);
      if (!result.success) return alert("Invalid JSON format for nodes");
      onApply(result.data);
    } catch (e) {
      onApply([]);
    }
  };

  return (
    <div className="mt-5">
      <div className="border border-gray-300 rounded mb-3">
        <Editor
          height={500}
          language="json"
          value={jsonDraft}
          onChange={(v) => setJsonDraft(v || "")}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
      <div className="flex gap-2">
        <Button onClick={handleSave}>Save JSON</Button>
      </div>
    </div>
  );
}

export default NodesJsonEditor;
