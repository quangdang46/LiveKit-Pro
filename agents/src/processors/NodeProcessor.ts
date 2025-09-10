import { Node } from "../types";
import { ProcessingResult } from "../types/context";
import { RecordingClient } from "../http/RecordingClient";
import { ProcessorContext } from "./ProcessorContext";

export type ProcessorServices = {
  recordingClient: RecordingClient;
}

export abstract class NodeProcessor {
  abstract process(
    node: Node,
    context: ProcessorContext,
    input?: any
  ): Promise<ProcessingResult>;

  protected findNextNode(node: Node, input?: string): string | null {
    if (node.edges.length === 0) return null;

    const matchingEdge = node.edges.find(
      (edge) => edge.condition && edge.condition.key === input
    );
    if (matchingEdge) return matchingEdge.to;

    const defaultEdge = node.edges.find((edge) => !edge.condition);
    return defaultEdge ? defaultEdge.to : null;
  }

  protected getServices(context: ProcessorContext): ProcessorServices {
    return context.getServices();
  }
}
