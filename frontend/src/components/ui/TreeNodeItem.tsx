import { Node } from "@/types/node";
import { useState } from "react";
import { EditNodeForm } from "./EditNodeForm";
import { AddChildForm } from "./AddChildForm";
import { NodeDisplay } from "./NodeDisplay";
import { ModeToggle } from "./ModeToggle";

type TreeNodeProps = {
  node: Node;
  level?: number;
  onUpdate: (updatedNode: Node) => void;
  onAddChild: (parentNode: Node, newChild: Node) => void;
};

export function TreeNodeItem({
  node,
  level = 0,
  onUpdate,
  onAddChild,
}: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editMode, setEditMode] = useState<ModeToggle>("json");
  const [addChildMode, setAddChildMode] = useState<ModeToggle>("json");

  const handleSave = (data: any) => {
    const updatedNode = {
      ...node,
      ...data,
    };
    onUpdate(updatedNode);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditMode("json");
  };

  const handleAddChild = (data: any) => {
    const newChild: Node = {
      id: `${node.id}-${Date.now()}`,
      name: data.name,
      content: data.content,
      type: data.type,
      status: data.status,
      children: [],
    };
    onAddChild(node, newChild);
    setIsAddingChild(false);
    setAddChildMode("json");
  };

  const handleCancelAddChild = () => {
    setIsAddingChild(false);
    setAddChildMode("json");
  };

  return (
    <div className="tree-node mb-2">
      <div
        className="tree-node-content"
        style={{ paddingLeft: `${level * 20}px` }}
      >
        <div className="tree-node-info">
          {isEditing ? (
            <EditNodeForm
              node={node}
              mode={editMode}
              onModeChange={setEditMode}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <NodeDisplay
              node={node}
              level={level}
              isCollapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
              onEdit={() => setIsEditing(true)}
              onAddChild={() => setIsAddingChild(true)}
            />
          )}
        </div>
      </div>

      {isAddingChild && (
        <AddChildForm
          level={level}
          mode={addChildMode}
          onModeChange={setAddChildMode}
          onAdd={handleAddChild}
          onCancel={handleCancelAddChild}
        />
      )}

      {node.children && node.children.length > 0 && !isCollapsed && (
        <>
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
            />
          ))}
        </>
      )}
    </div>
  );
}
