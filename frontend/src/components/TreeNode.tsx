"use client";
import { mockData } from "@/mock";
import { Node, NodeSchema } from "@/types/node";
import { useMemo, useState } from "react";
import NodesJsonEditor from "./NodesJsonEditor";
import { TreeNodeItem } from "./TreeNodeItem";
import { Button } from "@/components/ui/button";
import { z } from "zod";

export default function TreeNode() {
  const [nodes, setNodes] = useState<Node[]>(mockData);

  const rootNodes = useMemo(() => nodes.filter((n) => !n.parentId), [nodes]);

  const getChildren = (parentId: string) =>
    nodes.filter((n) => n.parentId === parentId);

  const handleUpdateNode = (updated: Node) => {
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleAddChild = (parent: Node, newChild: Omit<Node, "parentId">) => {
    const child: Node = { ...newChild, parentId: parent.id };
    setNodes((prev) => [...prev, child]);
  };

  const collectDescendantIds = (id: string): Set<string> => {
    const toVisit = [id];
    const removed = new Set<string>();
    while (toVisit.length > 0) {
      const current = toVisit.pop()!;
      removed.add(current);
      for (const c of nodes) if (c.parentId === current) toVisit.push(c.id);
    }
    return removed;
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => {
      const removed = collectDescendantIds(nodeId);
      return prev.filter((n) => !removed.has(n.id));
    });
  };

  const handleTestCall = () => {
    const ArraySchema = z.array(NodeSchema);
    const { success, data } = ArraySchema.safeParse(nodes);
    console.log(success ? data : "Invalid JSON format");
  };

  const handleApplyJson = (newNodes: Node[]) => setNodes(newNodes);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Button onClick={handleTestCall} className="w-full">
        Test Call
      </Button>
      <div className="mt-5">
        {rootNodes.map((root) => (
          <TreeNodeItem
            key={root.id}
            node={root}
            getChildren={getChildren}
            onUpdate={handleUpdateNode}
            onAddChild={handleAddChild}
            onDelete={handleDeleteNode}
          />
        ))}
      </div>

      <NodesJsonEditor nodes={nodes} onApply={handleApplyJson} />
    </div>
  );
}
