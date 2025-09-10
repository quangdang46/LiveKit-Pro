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
    if (!this.isDTMFNode(node)) {
      return {
        success: false,
        error: "Invalid node type for DTMFNodeProcessor",
      };
    }

    const dtmfNode = node as DTMFNode;
    const context = processorContext.getExecutionContext();

    try {
      const digit = this.extractDigit(input);
      if (context.isSpeaking && this.isValidDigit(digit)) {
        return this.handleSpeakingInterrupt(
          dtmfNode,
          node,
          processorContext,
          digit
        );
      }
      if (this.isValidDigit(digit)) {
        return this.handleDigit(dtmfNode, node, digit);
      }
      return this.promptForInput(dtmfNode, processorContext);
    } catch (error) {
      return { success: false, error: `Failed to process DTMF node: ${error}` };
    }
  }

  private isDTMFNode(node: Node): boolean {
    return node.type === "DTMFNode";
  }

  private extractDigit(input?: any): string | undefined {
    const value = input?.digit ?? input;
    return typeof value === "string" ? value : undefined;
  }

  private isValidDigit(digit?: string): digit is string {
    return typeof digit === "string" && digit.length > 0;
  }

  private handleSpeakingInterrupt(
    dtmfNode: DTMFNode,
    node: Node,
    processorContext: ProcessorContext,
    digit?: string
  ): ProcessingResult {
    processorContext.updateContext({
      isSpeaking: false,
      interruptHandled: true,
    });
    if (digit && dtmfNode.data.options.includes(digit)) {
      const nextNodeId = this.findNextNode(node, digit) ?? undefined;
      return {
        success: true,
        nextNodeId,
        shouldWait: false,
        isInterrupt: true,
        output: { type: "dtmf", message: `You selected: ${digit}` },
      };
    }
    return {
      success: true,
      shouldWait: true,
      shouldRollback: true,
      isInterrupt: true,
      output: { type: "dtmf", message: dtmfNode.data.prompt },
    };
  }

  private handleDigit(
    dtmfNode: DTMFNode,
    node: Node,
    digit: string
  ): ProcessingResult {
    if (dtmfNode.data.options.includes(digit)) {
      const nextNodeId = this.findNextNode(node, digit) ?? undefined;
      return {
        success: true,
        nextNodeId,
        shouldWait: false,
        output: { type: "dtmf", message: `You selected: ${digit}` },
      };
    }
    const options = dtmfNode.data.options.join(", ");
    const message = `Invalid option: ${digit}. Please choose: ${options}`;
    return {
      success: false,
      error: message,
      shouldWait: true,
      output: { type: "error", message },
    };
  }

  private promptForInput(
    dtmfNode: DTMFNode,
    processorContext: ProcessorContext
  ): ProcessingResult {
    processorContext.updateContext({ isSpeaking: true });
    return {
      success: true,
      shouldWait: true,
      output: { type: "dtmf", message: dtmfNode.data.prompt },
    };
  }
}
