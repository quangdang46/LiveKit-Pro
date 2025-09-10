import { DTMFNodeProcessor } from "./DTMFNodeProcessor";
import { SpeechNodeProcessor } from "./SpeechNodeProcessor";
import { NodeProcessor } from "./NodeProcessor";
import { NodeType } from "../types";
import { RecordingNodeProcessor } from "./RecordingNodeProcessor";

export class ProcessorFactory {
  private static processors = new Map<NodeType, () => NodeProcessor>();

  static {
    ProcessorFactory.registerProcessor(
      "SpeechNode",
      () => new SpeechNodeProcessor()
    );
    ProcessorFactory.registerProcessor(
      "DTMFNode",
      () => new DTMFNodeProcessor()
    );
    ProcessorFactory.registerProcessor(
      "RecordingNode",
      () => new RecordingNodeProcessor()
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

  static unregisterProcessor(nodeType: NodeType): boolean {
    return this.processors.delete(nodeType);
  }

  static getRegisteredTypes(): NodeType[] {
    return Array.from(this.processors.keys());
  }
}
