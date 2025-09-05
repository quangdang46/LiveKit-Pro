import { Node } from "@/types/node";
import { ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type NodeDisplayProps = {
  node: Node;
  level: number;
  isCollapsed: boolean;
  hasChildren?: boolean;
  onToggleCollapse: () => void;
  onEdit: () => void;
  onAddChild: () => void;
  onDelete: () => void;
};

export function NodeDisplay({
  node,
  level,
  isCollapsed,
  hasChildren = false,
  onToggleCollapse,
  onEdit,
  onAddChild,
  onDelete,
}: NodeDisplayProps) {
  const isSpeech = (n: Node): n is Node & { data: { message: string } } =>
    n.type === "SpeechNode";
  const isDTMF = (
    n: Node
  ): n is Node & { data: { prompt: string; options: string[] } } =>
    n.type === "DTMFNode";
  return (
    <div
      className={`node-display flex items-center gap-2 px-2 py-1 rounded${
        level === 0
          ? "bg-blue-50 border-2 border-blue-500"
          : "bg-gray-100 border border-gray-300"
      }`}
    >
      {hasChildren && (
        <Button
          variant="ghost"
          onClick={onToggleCollapse}
          className="bg-none border-none cursor-pointer p-0.5 mr-1 text-xs flex items-center text-gray-600 transition-transform duration-200"
        >
          {isCollapsed ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </Button>
      )}
      <span>
        <strong className="text-blue-700">{node.type}</strong>
        <span className="text-gray-700">
          {isSpeech(node)
            ? ` - ${node.data.message}`
            : isDTMF(node)
            ? ` - ${node.data.prompt} [${(node.data.options || []).join(", ")}]`
            : ""}
        </span>
      </span>
      <div className="ml-auto flex items-center gap-2">
        <Button
          onClick={onEdit}
          className="edit-btn px-2 py-1 bg-green-600 text-white border-none rounded text-xs cursor-pointer mr-1 hover:bg-green-700"
          variant="ghost"
        >
          Edit
        </Button>
        <Button
          onClick={onAddChild}
          className="add-child-btn px-2 py-1 bg-blue-600 text-white border-none rounded text-xs cursor-pointer hover:bg-blue-700"
          variant="ghost"
        >
          Add Child
        </Button>
        <Button
          onClick={onDelete}
          className="delete-btn px-2 py-1 bg-red-600 text-white border-none rounded text-xs cursor-pointer hover:bg-red-700 flex items-center gap-1"
          variant="destructive"
          title="Delete node"
        >
          <Trash2 size={12} />
          Delete
        </Button>
      </div>
    </div>
  );
}
