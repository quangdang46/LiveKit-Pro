import { NodeProcessor } from "./NodeProcessor";
import { ExecutionContext, ProcessingResult } from "../types/context";
import { Node, RecordingNode } from "../types";
import { RecordingClient } from "../http/RecordingClient";

export class RecordingNodeProcessor extends NodeProcessor {
  private recordingClient = new RecordingClient();

  async process(
    node: Node,
    context: ExecutionContext,
    input?: any
  ): Promise<ProcessingResult> {
    if (node.type !== "RecordingNode") {
      return {
        success: false,
        error: "Invalid node type for RecordingNodeProcessor",
      };
    }

    const recordingNode = node as RecordingNode;

    try {
      // Speak the recording message
      context.isSpeaking = true;

      // Attempt to start recording (this might require room context)
      // For now, just announce the recording start
      const nextNodeId = this.findNextNode(node);
      
      return {
        success: true,
        nextNodeId: nextNodeId ?? undefined,
        shouldWait: false,
        output: {
          type: "recording",
          message: recordingNode.data.message,
        },
      };
    } catch (error) {
      const nextNodeId = this.findNextNode(node);
      return {
        success: false,
        error: `Failed to process recording: ${error}`,
        nextNodeId: nextNodeId ?? undefined,
        output: {
          type: "error",
          message: `Recording failed: ${error}`,
        },
      };
    }
  }
}
