import { NodeProcessor } from "./NodeProcessor";
import { Node, SpeechNode } from "../types";
import { ExecutionContext, ProcessingResult } from "../types/context";
import { ROOT_NODE_ID } from "../constant";

export class SpeechNodeProcessor extends NodeProcessor {
  async process(
    node: Node,
    context: ExecutionContext,
    input?: any
  ): Promise<ProcessingResult> {
    if (node.type !== "SpeechNode") {
      return {
        success: false,
        error: "Invalid node type for SpeechNodeProcessor",
      };
    }

    const speechNode = node as SpeechNode;

    try {
      const nextNodeId = this.findNextNode(node);

      const shouldAutoTransition = node.id === ROOT_NODE_ID;

      return {
        success: true,
        nextNodeId: nextNodeId ?? undefined,
        shouldWait: !shouldAutoTransition,
        output: {
          type: "speech",
          message: speechNode.data.message,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process speech node: ${error}`,
      };
    }
  }
}
