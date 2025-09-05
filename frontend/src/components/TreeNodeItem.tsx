import { Node } from "@/types/node";
import { useMemo, useState } from "react";
import { EditNodeForm } from "./EditNodeForm";
import { AddChildForm } from "./AddChildForm";
import { NodeDisplay } from "./NodeDisplay";
import { ModeToggle } from "./ModeToggle";

type TreeNodeProps = {
  node: Node;
  level?: number;
  getChildren: (parentId: string) => Node[];
  onUpdate: (updatedNode: Node) => void;
  onAddChild: (parentNode: Node, newChild: Node) => void;
  onDelete: (nodeId: string) => void;
};

export function TreeNodeItem({
  node,
  level = 0,
  getChildren,
  onUpdate,
  onAddChild,
  onDelete,
}: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editMode, setEditMode] = useState<ModeToggle>("json");
  const [addChildMode, setAddChildMode] = useState<ModeToggle>("form");

  const children = useMemo(() => getChildren(node.id), [getChildren, node.id]);

  const handleSave = (data: any) => {
    onUpdate({ ...node, ...data });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditMode("form");
  };

  const handleAddChild = (data: any) => {
    const newChild: Node = {
      id: crypto.randomUUID(),
      type: data.type,
      data: data.data,
      edges: [],
    };
    onAddChild(node, newChild);
    setIsAddingChild(false);
    setAddChildMode("form");
  };

  const handleCancelAddChild = () => {
    setIsAddingChild(false);
    setAddChildMode("form");
  };

  const handleDelete = () => {
    onDelete(node.id);
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
              hasChildren={children.length > 0}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
              onEdit={() => setIsEditing(true)}
              onAddChild={() => setIsAddingChild(true)}
              onDelete={handleDelete}
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

      {children.length > 0 && !isCollapsed && (
        <>
          {children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              getChildren={getChildren}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
              onDelete={onDelete}
            />
          ))}
        </>
      )}
    </div>
  );
}
