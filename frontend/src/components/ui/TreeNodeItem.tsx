import { Node } from "@/types/node";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface TreeNodeProps {
  node: Node;
  level?: number;
  onUpdate: (updatedNode: Node) => void;
  onAddChild: (parentNode: Node, newChild: Node) => void;
}

export function TreeNodeItem({
  node,
  level = 0,
  onUpdate,
  onAddChild,
}: TreeNodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editForm, setEditForm] = useState({
    name: node.name,
    content: node.content,
    type: node.type,
    status: node.status,
  });
  const [newChildForm, setNewChildForm] = useState({
    name: "",
    content: "",
    type: "BRANCH" as const,
    status: "ACTIVE" as const,
  });

  const handleSave = () => {
    const updatedNode = {
      ...node,
      ...editForm,
    };
    onUpdate(updatedNode);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm({
      name: node.name,
      content: node.content,
      type: node.type,
      status: node.status,
    });
    setIsEditing(false);
  };

  const handleAddChild = () => {
    const newChild: Node = {
      id: `${node.id}-${Date.now()}`,
      name: newChildForm.name,
      content: newChildForm.content,
      type: newChildForm.type,
      status: newChildForm.status,
      children: [],
    };
    onAddChild(node, newChild);
    setNewChildForm({
      name: "",
      content: "",
      type: "BRANCH",
      status: "ACTIVE",
    });
    setIsAddingChild(false);
  };

  const handleCancelAddChild = () => {
    setNewChildForm({
      name: "",
      content: "",
      type: "BRANCH",
      status: "ACTIVE",
    });
    setIsAddingChild(false);
  };

  return (
    <div className="tree-node mb-2">
      <div
        className="tree-node-content"
        style={{ paddingLeft: `${level * 20}px` }}
      >
        <div className="tree-node-info">
          {isEditing ? (
            <div className="edit-form border border-gray-300 p-3 rounded bg-gray-50 mt-2">
              <div className="mb-2">
                <strong>Edit Node {node.id}:</strong>
              </div>
              <div className="mb-2">
                <label className="block mb-1">Name: </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="p-1 rounded border border-gray-300"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1">Content: </label>
                <textarea
                  value={editForm.content}
                  onChange={(e) =>
                    setEditForm({ ...editForm, content: e.target.value })
                  }
                  rows={2}
                  cols={30}
                  className="p-1 rounded border border-gray-300"
                />
              </div>
              <div className="mb-2">
                <label className="block mb-1">Type: </label>
                <select
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm({ ...editForm, type: e.target.value as any })
                  }
                  className="p-1 rounded border border-gray-300"
                >
                  <option value="ROOT">ROOT</option>
                  <option value="BRANCH">BRANCH</option>
                </select>
              </div>
              <div className="mb-2">
                <label className="block mb-1">Status: </label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value as any })
                  }
                  className="p-1 rounded border border-gray-300"
                >
                  <option value="ACTIVE">ACTIVE</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-3 py-1.5 bg-gray-500 text-white border-none rounded cursor-pointer hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className={`node-display flex items-center gap-2 px-2 py-1 rounded ${
                level === 0
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "bg-gray-100 border border-gray-300"
              }`}
            >
              {node.children && node.children.length > 0 && (
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className={`bg-none border-none cursor-pointer p-0.5 mr-1 text-xs flex items-center text-gray-600 transition-transform duration-200 ${
                    isCollapsed ? "rotate-[-90deg]" : "rotate-0"
                  }`}
                >
                  <ChevronDown size={14} />
                </button>
              )}
              <span>
                <strong className="text-blue-700">{node.name}</strong>
                <span className="text-gray-600 text-sm">
                  (ID: {node.id}, Type: {node.type}, Status:
                  <span
                    className={`${
                      node.status === "ACTIVE"
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {" "}
                    {node.status}
                  </span>
                  )
                </span>
                {node.content && (
                  <span className="text-gray-600">
                    {" "}
                    - Content: {node.content}
                  </span>
                )}
              </span>
              <button
                onClick={() => setIsEditing(true)}
                className="edit-btn px-2 py-1 bg-green-600 text-white border-none rounded text-xs cursor-pointer mr-1 hover:bg-green-700"
              >
                Edit
              </button>
              <button
                onClick={() => setIsAddingChild(true)}
                className="add-child-btn px-2 py-1 bg-blue-600 text-white border-none rounded text-xs cursor-pointer hover:bg-blue-700"
              >
                Add Child
              </button>
            </div>
          )}
        </div>
      </div>

      {isAddingChild && (
        <div style={{ paddingLeft: `${(level + 1) * 20}px` }} className="mt-2">
          <div className="add-child-form border border-blue-500 p-3 rounded bg-blue-50 mb-2">
            <div className="mb-2">
              <strong>Add New Child Node:</strong>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Name: </label>
              <input
                type="text"
                value={newChildForm.name}
                onChange={(e) =>
                  setNewChildForm({ ...newChildForm, name: e.target.value })
                }
                className="p-1 rounded border border-gray-300 w-48"
                placeholder="Enter node name"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Content: </label>
              <textarea
                value={newChildForm.content}
                onChange={(e) =>
                  setNewChildForm({ ...newChildForm, content: e.target.value })
                }
                rows={2}
                className="p-1 rounded border border-gray-300 w-48"
                placeholder="Enter content"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Type: </label>
              <select
                value={newChildForm.type}
                onChange={(e) =>
                  setNewChildForm({
                    ...newChildForm,
                    type: e.target.value as any,
                  })
                }
                className="p-1 rounded border border-gray-300"
              >
                <option value="BRANCH">BRANCH</option>
                <option value="CONDITION">CONDITION</option>
                <option value="ACTION">ACTION</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="block mb-1">Status: </label>
              <select
                value={newChildForm.status}
                onChange={(e) =>
                  setNewChildForm({
                    ...newChildForm,
                    status: e.target.value as any,
                  })
                }
                className="p-1 rounded border border-gray-300"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="WARNING">WARNING</option>
                <option value="ERROR">ERROR</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleAddChild}
                className="px-3 py-1.5 bg-blue-600 text-white border-none rounded cursor-pointer hover:bg-blue-700"
              >
                Add
              </button>
              <button
                onClick={handleCancelAddChild}
                className="px-3 py-1.5 bg-gray-500 text-white border-none rounded cursor-pointer hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {node.children && node.children.length > 0 && !isCollapsed && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              level={level + 1}
              onUpdate={onUpdate}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
