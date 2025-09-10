import { ExecutionContext, ProcessingResult } from "../types/context";
import { Script, Node } from "../types";
import { ProcessorFactory } from "./ProcessorFactory";
import { ROOT_NODE_ID } from "../constant";
import { ServiceManager } from "../services/ServiceManager";
import { ProcessorContext } from "./ProcessorContext";

export class ScriptProcessor {
  private readonly script: Script;
  private readonly nodeMap: Map<string, Node>;
  private readonly processorContext: ProcessorContext;

  constructor(script: Script, serviceManager: ServiceManager) {
    this.script = script;
    this.nodeMap = new Map(script.scriptData.map((node) => [node.id, node]));

    const executionContext: ExecutionContext = {
      currentNodeId: ROOT_NODE_ID,
    };

    this.processorContext = new ProcessorContext(
      executionContext,
      serviceManager
    );
  }

  async start(): Promise<ProcessingResult> {
    return this.processCurrentNode();
  }

  async handleInput(input: any): Promise<ProcessingResult> {
    this.processorContext.updateContext({ lastInput: input });

    if (input?.roomName) {
      this.processorContext.updateContext({ roomName: input.roomName });
    }
    if (input?.participantId) {
      this.processorContext.updateContext({
        participantId: input.participantId,
      });
    }

    this.processorContext.updateContext({ interruptHandled: false });

    return this.processCurrentNode(input);
  }

  private async processCurrentNode(input?: any): Promise<ProcessingResult> {
    const context = this.processorContext.getExecutionContext();
    const currentNode = this.nodeMap.get(context.currentNodeId);

    if (!currentNode) {
      return {
        success: false,
        error: `Node not found: ${context.currentNodeId}`,
      };
    }

    try {
      const processor = ProcessorFactory.createProcessor(currentNode.type);
      const result = await processor.process(
        currentNode,
        this.processorContext,
        input
      );

      if (result.shouldRollback) {
        return result;
      }

      if (result.success && result.nextNodeId) {
        this.processorContext.updateContext({
          currentNodeId: result.nextNodeId,
        });
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
