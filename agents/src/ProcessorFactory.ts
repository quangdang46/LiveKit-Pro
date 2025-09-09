import { DTMFNodeProcessor } from "./DTMFNodeProcessor";
import { SpeechNodeProcessor } from "./SpeechNodeProcessor";
import { NodeProcessor } from "./NodeProcessor";
import { NodeType } from "./types";

export class ProcessorFactory {
  private static processors = new Map<NodeType | string, () => NodeProcessor>();

  static {
    ProcessorFactory.registerProcessor(
      "SpeechNode",
      () => new SpeechNodeProcessor()
    );
    ProcessorFactory.registerProcessor(
      "DTMFNode",
      () => new DTMFNodeProcessor()
    );
  }

  static registerProcessor(
    nodeType: NodeType,
    factory: () => NodeProcessor
  ): void {
    this.processors.set(nodeType, factory);
  }

  static createProcessor(nodeType: NodeType): NodeProcessor {
    const factory = this.processors.get(nodeType);
    if (!factory) {
      throw new Error(`No processor registered for node type: ${nodeType}`);
    }
    return factory();
  }

  static registerProcessorInstance(
    nodeType: string,
    processor: NodeProcessor
  ): void {
    this.processors.set(nodeType, () => processor);
  }

  static unregisterProcessor(nodeType: NodeType): boolean {
    return this.processors.delete(nodeType);
  }
}
