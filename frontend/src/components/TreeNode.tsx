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

  const nodeById = useMemo(() => {
    const map = new Map<string, Node>();
    for (const n of nodes) map.set(n.id, n);
    return map;
  }, [nodes]);

  const rootNodes = useMemo(() => {
    const targets = new Set<string>();
    for (const n of nodes) for (const e of n.edges) targets.add(e.to);
    return nodes.filter((n) => !targets.has(n.id));
  }, [nodes]);

  const getChildren = (parentId: string) => {
    const parent = nodeById.get(parentId);
    if (!parent) return [] as Node[];
    return parent.edges
      .map((e) => nodeById.get(e.to))
      .filter((n): n is Node => Boolean(n));
  };

  const handleUpdateNode = (updated: Node) => {
    setNodes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
  };

  const handleAddChild = (parent: Node, newChild: Node) => {
    setNodes((prev) => {
      const updated = prev.map((n) =>
        n.id === parent.id
          ? { ...n, edges: [...n.edges, { to: newChild.id }] }
          : n
      );
      return [...updated, newChild];
    });
  };

  const collectDescendantIds = (id: string): Set<string> => {
    const byId = new Map(nodes.map((n) => [n.id, n] as const));
    const toVisit = [id];
    const removed = new Set<string>();
    while (toVisit.length > 0) {
      const current = toVisit.pop()!;
      removed.add(current);
      const node = byId.get(current);
      if (!node) continue;
      for (const e of node.edges) toVisit.push(e.to);
    }
    return removed;
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => {
      const removed = collectDescendantIds(nodeId);
      return prev
        .filter((n) => !removed.has(n.id))
        .map((n) => ({
          ...n,
          edges: n.edges.filter((e) => !removed.has(e.to)),
        }));
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
