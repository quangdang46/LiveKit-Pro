import { NodeProcessor } from "./NodeProcessor";
import { ProcessingResult } from "../types/context";
import { Node, DTMFNode } from "../types";
import { ProcessorContext } from "./ProcessorContext";

export class DTMFNodeProcessor extends NodeProcessor {
  async process(
    node: Node,
    processorContext: ProcessorContext,
    input?: any
  ): Promise<ProcessingResult> {
    if (node.type !== "DTMFNode") {
      return {
        success: false,
        error: "Invalid node type for DTMFNodeProcessor",
      };
    }

    const dtmfNode = node as DTMFNode;
    const context = processorContext.getExecutionContext();

    try {
      const digit = input?.digit || input;

      if (context.isSpeaking && digit && typeof digit === "string") {
        processorContext.updateContext({
          isSpeaking: false,
          interruptHandled: true,
        });

        if (dtmfNode.data.options.includes(digit)) {
          const nextNodeId = this.findNextNode(node, digit);
          return {
            success: true,
            nextNodeId: nextNodeId ?? undefined,
            shouldWait: false,
            isInterrupt: true,
            output: {
              type: "dtmf",
              message: `You selected: ${digit}`,
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

      if (digit && typeof digit === "string") {
        if (dtmfNode.data.options.includes(digit)) {
          const nextNodeId = this.findNextNode(node, digit);
          return {
            success: true,
            nextNodeId: nextNodeId ?? undefined,
            shouldWait: false,
            output: {
              type: "dtmf",
              message: `You selected: ${digit}`,
            },
          };
        } else {
          return {
            success: false,
            error: `Invalid option: ${digit}. Please choose: ${dtmfNode.data.options.join(
              ", "
            )}`,
            shouldWait: true,
            output: {
              type: "error",
              message: `Invalid option: ${digit}. Please choose: ${dtmfNode.data.options.join(
                ", "
              )}`,
            },
          };
        }
      }

      processorContext.updateContext({ isSpeaking: true });
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
