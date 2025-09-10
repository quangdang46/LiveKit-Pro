import { NodeProcessor } from "./NodeProcessor";
import { ProcessingResult } from "../types/context";
import { Node, RecordingNode } from "../types";
import { ProcessorContext } from "./ProcessorContext";

export class RecordingNodeProcessor extends NodeProcessor {
  async process(
    node: Node,
    processorContext: ProcessorContext,
    input?: any
  ): Promise<ProcessingResult> {
    if (node.type !== "RecordingNode") {
      return {
        success: false,
        error: "Invalid node type for RecordingNodeProcessor",
      };
    }

    const recordingNode = node as RecordingNode;
    const services = this.getServices(processorContext);
    const context = processorContext.getExecutionContext();

    try {
      processorContext.updateContext({ isSpeaking: true });

      let recordingStarted = false;
      const roomName = input?.roomName || context.roomName;
      const participantId = input?.participantId || context.participantId;

      let egressId: string | undefined;

      if (services.recordingClient && roomName && participantId) {
        try {
          const recordingResponse =
            await services.recordingClient.startRecording(
              roomName,
              participantId,
              input?.maxDuration || 60
            );
          recordingStarted = true;
          egressId = recordingResponse.egressId;
        } catch (error) {
          throw error;
        }
      } else {
        throw new Error("Cannot start recording - missing requirements");
      }

      const nextNodeId = this.findNextNode(node);
      console.log("recording nextNodeId===>", nextNodeId);
      return {
        success: true,
        nextNodeId: nextNodeId ?? undefined,
        shouldWait: false,
        isInterrupt: true,
        output: {
          type: "recording",
          message: recordingNode.data.message,
          recordingStarted,
          egressId,
          playBeep: true,
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
