import { Node } from "@/types/node";
import { ChevronDown, ChevronRight } from "lucide-react";

type NodeDisplayProps = {
  node: Node;
  level: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onEdit: () => void;
  onAddChild: () => void;
};

export function NodeDisplay({
  node,
  level,
  isCollapsed,
  onToggleCollapse,
  onEdit,
  onAddChild,
}: NodeDisplayProps) {
  return (
    <div
      className={`node-display flex items-center gap-2 px-2 py-1 rounded ${
        level === 0
          ? "bg-blue-50 border-2 border-blue-500"
          : "bg-gray-100 border border-gray-300"
      }`}
    >
      {node.children && node.children.length > 0 && (
        <button
          onClick={onToggleCollapse}
          className="bg-none border-none cursor-pointer p-0.5 mr-1 text-xs flex items-center text-gray-600 transition-transform duration-200"
        >
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
      )}
      <span>
        <strong className="text-blue-700">{node.name}</strong>
        <span className="text-gray-600 text-sm">
          (ID: {node.id}, Type: {node.type}, Status:
          <span
            className={`${
              node.status === "ACTIVE" ? "text-green-600" : "text-gray-500"
            }`}
          >
            {node.status}
          </span>
          )
        </span>
        {node.content && (
          <span className="text-gray-600"> - Content: {node.content}</span>
        )}
      </span>
      <button
        onClick={onEdit}
        className="edit-btn px-2 py-1 bg-green-600 text-white border-none rounded text-xs cursor-pointer mr-1 hover:bg-green-700"
      >
        Edit
      </button>
      <button
        onClick={onAddChild}
        className="add-child-btn px-2 py-1 bg-blue-600 text-white border-none rounded text-xs cursor-pointer hover:bg-blue-700"
      >
        Add Child
      </button>
    </div>
  );
}
