"use client";
import { mockData } from "@/mock";
import { Node } from "@/types/node";
import { useState } from "react";
import { TreeNodeItem } from "./TreeNodeItem";

export default function TreeNode() {
  const [data, setData] = useState<Node>(mockData);

  const updateNodeInTree = (node: Node, updatedNode: Node): Node => {
    if (node.id === updatedNode.id) {
      return updatedNode;
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) =>
          updateNodeInTree(child, updatedNode)
        ),
      };
    }
    return node;
  };

  const addChildToTree = (
    node: Node,
    parentNode: Node,
    newChild: Node
  ): Node => {
    if (node.id === parentNode.id) {
      return {
        ...node,
        children: [...(node.children || []), newChild],
      };
    }
    if (node.children) {
      return {
        ...node,
        children: node.children.map((child) =>
          addChildToTree(child, parentNode, newChild)
        ),
      };
    }
    return node;
  };

  const handleUpdateNode = (updatedNode: Node) => {
    setData((prevData) => updateNodeInTree(prevData, updatedNode));
  };

  const handleAddChild = (parentNode: Node, newChild: Node) => {
    setData((prevData) => addChildToTree(prevData, parentNode, newChild));
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <TreeNodeItem
        node={data}
        onUpdate={handleUpdateNode}
        onAddChild={handleAddChild}
      />

      <div className="mt-5">
        <h2 className=" overflow-auto text-xl font-semibold mb-4 text-gray-700">
          Raw JSON Data:
        </h2>
        <pre className="">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
