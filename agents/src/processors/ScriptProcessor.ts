import { ExecutionContext, ProcessingResult } from "../types/context";
import { Script, Node } from "../types";
import { ProcessorFactory } from "./ProcessorFactory";
import { ROOT_NODE_ID } from "../constant";

export class ScriptProcessor {
  private readonly script: Script;
  private readonly nodeMap: Map<string, Node>;
  private readonly context: ExecutionContext;

  constructor(script: Script) {
    this.script = script;
    this.nodeMap = new Map(script.scriptData.map((node) => [node.id, node]));
    this.context = {
      currentNodeId: ROOT_NODE_ID,
    };
  }

  async start(): Promise<ProcessingResult> {
    return this.processCurrentNode();
  }

  async handleInput(input: any): Promise<ProcessingResult> {
    this.context.lastInput = input;
    return this.processCurrentNode(input);
  }

  private async processCurrentNode(input?: any): Promise<ProcessingResult> {
    const currentNode = this.nodeMap.get(this.context.currentNodeId);
    if (!currentNode) {
      return {
        success: false,
        error: `Node not found: ${this.context.currentNodeId}`,
      };
    }

    try {
      const processor = ProcessorFactory.createProcessor(currentNode.type);
      const result = await processor.process(currentNode, this.context, input);

      if (result.success && result.nextNodeId) {
        this.context.currentNodeId = result.nextNodeId;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        error: `Processing error: ${error}`,
      };
    }
  }
}
