"use client";

import React from "react";
import Editor from "@monaco-editor/react";

type ScriptEditorProps = {
  value: any;
  onChange?: (value: any) => void;
  readOnly?: boolean;
  height?: string;
};

export default function ScriptEditor({
  value,
  onChange,
  readOnly = false,
  height = "250px",
}: ScriptEditorProps) {
  const handleChange = (value: string | undefined) => {
    if (onChange && value) {
      try {
        const parsedValue = JSON.parse(value);
        onChange(parsedValue);
      } catch (error) {
        console.error("Invalid JSON:", error);
      }
    }
  };

  return (
    <div className="border rounded-md overflow-hidden" style={{ height }}>
      <Editor
        height="100%"
        language="json"
        value={JSON.stringify(value, null, 2)}
        onChange={handleChange}
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          theme: "vs-light",
        }}
      />
    </div>
  );
}
