import { NodeProcessor } from "./NodeProcessor";
import { Node, SpeechNode } from "../types";
import { ProcessingResult } from "../types/context";
import { ROOT_NODE_ID } from "../constant";
import { ProcessorContext } from "./ProcessorContext";

export class SpeechNodeProcessor extends NodeProcessor {
  async process(
    node: Node,
    processorContext: ProcessorContext,
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

      const shouldAutoTransition = node.id === ROOT_NODE_ID || !!nextNodeId;

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
