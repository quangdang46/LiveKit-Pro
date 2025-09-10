import { NodeProcessor } from "./NodeProcessor";
import { ExecutionContext, ProcessingResult } from "../types/context";
import { Node, DTMFNode } from "../types";

export class DTMFNodeProcessor extends NodeProcessor {
  async process(
    node: Node,
    context: ExecutionContext,
    input?: any
  ): Promise<ProcessingResult> {
    if (node.type !== "DTMFNode") {
      return {
        success: false,
        error: "Invalid node type for DTMFNodeProcessor",
      };
    }

    const dtmfNode = node as DTMFNode;

    try {
      if (context.isSpeaking && input && typeof input === "string") {
        context.isSpeaking = false;
        context.interruptHandled = true;

        if (dtmfNode.data.options.includes(input)) {
          const nextNodeId = this.findNextNode(node, input);
          return {
            success: true,
            nextNodeId: nextNodeId ?? undefined,
            shouldWait: false,
            isInterrupt: true,
            output: {
              type: "dtmf",
              message: `You selected: ${input}`,
            },
          };
        } else {
          return {
            success: true,
            shouldWait: true,
            shouldRollback: true,
            isInterrupt: true,
            output: {
              type: "dtmf",
              message: dtmfNode.data.prompt,
            },
          };
        }
      }

      if (input && typeof input === "string") {
        if (dtmfNode.data.options.includes(input)) {
          const nextNodeId = this.findNextNode(node, input);
          return {
            success: true,
            nextNodeId: nextNodeId ?? undefined,
            shouldWait: false,
            output: {
              type: "dtmf",
              message: `You selected: ${input}`,
            },
          };
        } else {
          return {
            success: false,
            error: `Invalid option: ${input}. Please choose: ${dtmfNode.data.options.join(
              ", "
            )}`,
            shouldWait: true,
            output: {
              type: "error",
              message: `Invalid option: ${input}. Please choose: ${dtmfNode.data.options.join(
                ", "
              )}`,
            },
          };
        }
      }

      context.isSpeaking = true;
      return {
        success: true,
        shouldWait: true,
        output: {
          type: "dtmf",
          message: dtmfNode.data.prompt,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process DTMF node: ${error}`,
      };
    }
  }
}
