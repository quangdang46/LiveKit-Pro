import { Node } from "../types";
import { ExecutionContext, ProcessingResult } from "../types/context";

export abstract class NodeProcessor {
  abstract process(
    node: Node,
    context: ExecutionContext,
    input?: any
  ): Promise<ProcessingResult>;

  protected findNextNode(node: Node, input?: string): string | null {
    if (node.edges.length === 0) {
      return null;
    }

    const matchingEdge = node.edges.find((edge) => {
      if (!edge.condition) {
        return true;
      }
      return edge.condition.key === input;
    });

    if (matchingEdge) {
      return matchingEdge.to;
    }

    const defaultEdge = node.edges.find((edge) => !edge.condition);
    return defaultEdge ? defaultEdge.to : null;
  }
}
