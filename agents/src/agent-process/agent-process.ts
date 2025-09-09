import { defineAgent, JobContext } from "@livekit/agents";
import { LiveKitProcess } from "../processors/LiveKitProcess";
import { ProcessingResult } from "../types/context";

type Metadata = {
  scriptId: string;
};

type MessageData = {
  type: string;
  digit?: string;
  [key: string]: any;
};

class AgentHandler {
  private liveKitProcess: LiveKitProcess;
  private ctx: JobContext;

  constructor(ctx: JobContext) {
    this.ctx = ctx;
    this.liveKitProcess = new LiveKitProcess();
  }

  async initialize(scriptId: string): Promise<void> {

    await this.ctx.connect();

    const initialResult = await this.liveKitProcess.start(`/script/${scriptId}`);
    
    if (initialResult?.output) {
      this.publishData(initialResult.output);
    }

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.ctx.room.on("dataReceived", async (payload, participant) => {
      try {
        const msg = this.parseMessage(payload);
        console.log("Agent received data", {
          msg,
          from: participant?.identity,
        });

        await this.handleMessage(msg);
      } catch (error) {
        console.log("Handler error:", error);
        this.publishError("Processing failed, please try again");
      }
    });
  }

  private parseMessage(payload: Uint8Array): MessageData {
    return JSON.parse(new TextDecoder().decode(payload));
  }

  private async handleMessage(msg: MessageData): Promise<void> {
    if (msg.type === "dtmf" && msg.digit) {
      await this.handleDTMFInput(msg.digit);
    }
  }

  private async handleDTMFInput(digit: string): Promise<void> {
    const result = await this.liveKitProcess.handleInput(digit);
    console.log("Processing result:", result);

    this.handleProcessingResult(result);
  }

  private handleProcessingResult(result: ProcessingResult | undefined): void {
    if (!result) {
      this.publishError("No result from processing");
      return;
    }

    if (result.success && result.output) {
      this.publishData(result.output);
    } else if (!result.success) {
      if (result.output) {
        this.publishData(result.output);
      } else if (result.error) {
        console.log("Error:", result.error);
        this.publishError(result.error);
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