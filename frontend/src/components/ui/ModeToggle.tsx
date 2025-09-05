import { Code, FileText } from "lucide-react";

export type ModeToggle = "form" | "json";

interface ModeToggleProps {
  mode: ModeToggle;
  onModeChange: (mode: ModeToggle) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onModeChange("form")}
        className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
          mode === "form"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        <FileText size={14} /> Form
      </button>
      <button
        type="button"
        onClick={() => onModeChange("json")}
        className={`px-3 py-1 rounded text-xs flex items-center gap-1 ${
          mode === "json"
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        <Code size={14} /> JSON
      </button>
    </div>
  );
}
