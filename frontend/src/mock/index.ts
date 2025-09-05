import { Node } from "@/types/node";

export const mockData: Node[] = [
  { id: "1", number: 1, text: "Script", parentId: "" },
  { id: "2", number: 2, text: "Main Branch", parentId: "1" },
  { id: "3", number: 3, text: "Child 1", parentId: "2" },
  { id: "4", number: 4, text: "Child 2", parentId: "2" },
  { id: "5", number: 5, text: "Child 3", parentId: "4" },
  { id: "6", number: 6, text: "Child 4", parentId: "5" },
];
