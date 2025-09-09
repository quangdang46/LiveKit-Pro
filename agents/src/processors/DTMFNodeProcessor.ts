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
      if (input && typeof input === "string") {
        if (dtmfNode.data.options.includes(input)) {
          const nextNodeId = this.findNextNode(node, input);
          return {
            success: true,
            nextNodeId: nextNodeId ?? undefined,
            output: {
              type: "dtmf",
              selectedOption: input,
              message: `You selected: ${input}`,
            },
          };
        } else {
          return {
            success: false,
            error: `Invalid option: ${input}. Please choose: ${dtmfNode.data.options.join(", ")}`,
            shouldWait: true,
            output: {
              type: "error", 
              message: `Invalid option: ${input}. Please choose: ${dtmfNode.data.options.join(", ")}`,
            },
          };
        }
      }

      return {
        success: true,
        shouldWait: true,
        output: {
          type: "dtmf_prompt",
          prompt: dtmfNode.data.prompt,
          options: dtmfNode.data.options,
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
