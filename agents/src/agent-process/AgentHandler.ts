import { defineAgent, JobContext } from "@livekit/agents";

import { LiveKitProcess } from "../processors/LiveKitProcess";
import { ProcessingResult } from "../types/context";
import { MessageData, Metadata } from "../types";

class AgentHandler {
  private liveKitProcess: LiveKitProcess;
  private ctx: JobContext;
  private activeRecordingEgressId?: string;

  constructor(ctx: JobContext) {
    this.ctx = ctx;
    this.liveKitProcess = new LiveKitProcess();
  }

  async initialize(scriptId: string): Promise<void> {
    await this.ctx.connect();

    const initialResult = await this.liveKitProcess.start(
      `/script/${scriptId}`
    );

    await this.drainAndPublish(initialResult);

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.ctx.room.on("dataReceived", async (payload, participant) => {
      try {
        const msg = this.parseMessage(payload);

        await this.handleMessage(msg);
      } catch (error) {
        console.log("Handler error:", error);
        this.publishError("Processing failed, please try again");
      }
    });

    this.ctx.room.on("disconnected", () => {
      console.log("Room disconnected, call ended!");
    });

    // end call
    this.ctx.room.on("participantDisconnected", async (p) => {
      console.log("Participant disconnected:", p.identity);

      // stop recording
      console.log("Stopping recording", {
        egressId: this.activeRecordingEgressId,
        participantIdentity: p.identity,
      });
      if (this.activeRecordingEgressId) {
        console.log("Stopping recording", {
          egressId: this.activeRecordingEgressId,
          participantIdentity: p.identity,
        });

        const serviceManager = this.liveKitProcess.getServiceManager();
        const recordingClient = serviceManager.getRecordingClient();

        try {
          await recordingClient.stopRecording(this.activeRecordingEgressId);
          console.log(`Recording stopped: ${this.activeRecordingEgressId}`);
          this.activeRecordingEgressId = undefined;
        } catch (error) {
          console.error("Failed to stop recording on disconnect:", error);
        }
      }
    });

    this.ctx.room.on("trackPublished", (track) => {
      console.log("Track published", track);
    });
  }

  private parseMessage(payload: Uint8Array): MessageData {
    return JSON.parse(new TextDecoder().decode(payload));
  }

  private async handleMessage(msg: MessageData): Promise<void> {
    // if (msg.type === "dtmf" && msg.digit) {
    //   await this.handleDTMFInput(msg.digit);
    // }

    switch (msg.type) {
      case "dtmf":
        if (!msg.digit) {
          this.publishError("No digit received");
          return;
        }

        await this.handleDTMFInput(msg.digit, msg.roomName, msg.participantId);
        break;

      // case "":
      default:
        break;
    }
  }

  private async handleDTMFInput(
    digit: string,
    roomName?: string,
    participantId?: string
  ): Promise<void> {
    const input = {
      digit,
      roomName,
      participantId,
    };

    const result = await this.liveKitProcess.handleInput(input);
    console.log("Processing result:", result);

    if (result.isInterrupt) {
      console.log("Interrupt detected, handling...");
    }

    await this.drainAndPublish(result);
  }

  private handleProcessingResult(result: ProcessingResult | undefined): void {
    if (!result) {
      this.publishError("No result from processing");
      return;
    }

    if (result.output) {
      if (result.output.type === "recording") {
        console.log("recording===>", result);
        if (result.output.recordingStarted && result.output.egressId) {
          this.activeRecordingEgressId = result.output.egressId;
        }
      }

      this.publishData(result.output);
      return;
    }

    if (result.error) {
      console.log("Error:", result.error);
      this.publishError(result.error);
    }
  }

  private async drainAndPublish(
    result: ProcessingResult | undefined
  ): Promise<void> {
    while (result) {
      this.handleProcessingResult(result);

      if (!result.success || result.shouldWait || result.shouldRollback) {
        return;
      }

      if (result.nextNodeId) {
        result = await this.liveKitProcess.handleInput(undefined as any);
      } else {
        result = undefined;
      }
    }
  }

  private publishData(data: any): void {
    this.ctx.room?.localParticipant?.publishData(
      new TextEncoder().encode(JSON.stringify(data)),
      { reliable: true }
    );
  }

  private publishError(message: string): void {
    this.publishData({
      type: "error",
      message,
    });
  }
}

export default defineAgent({
  entry: async (ctx: JobContext) => {
    const metadata = JSON.parse(ctx.job.metadata) as Metadata;
    const handler = new AgentHandler(ctx);
    await handler.initialize(metadata.scriptId);
  },
});
