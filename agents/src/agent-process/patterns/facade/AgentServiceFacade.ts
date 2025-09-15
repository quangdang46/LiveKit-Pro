import { JobContext } from "@livekit/agents";
import * as silero from "@livekit/agents-plugin-silero";
import { LiveKitProcess } from "../../../processors/LiveKitProcess";
import { ProcessingResult } from "../../../types/context";
import { MessageData } from "../../../types";
import { VoiceResponseHandler } from "../services/VoiceResponseHandler";
import { MessageHandler } from "../chain/MessageHandler";
import { DTMFHandler } from "../chain/DTMFHandler";
import { LiveKitProcessingStrategy } from "../strategy/LiveKitProcessingStrategy";
import { RoomEvent } from "@livekit/rtc-node";
import { handleError } from "../../../helpers";

export class AgentServiceFacade {
  private liveKitProcess: LiveKitProcess;
  private voiceHandler: VoiceResponseHandler;
  private messageChain!: MessageHandler;
  private activeRecordingEgressId?: string;

  constructor(private ctx: JobContext, vad: silero.VAD) {
    this.liveKitProcess = new LiveKitProcess();
    this.voiceHandler = new VoiceResponseHandler(ctx, vad);
    this.setupMessageChain();
    this.setupEventHandlers();
  }

  private setupMessageChain(): void {
    const processingStrategy = new LiveKitProcessingStrategy(
      this.liveKitProcess,
      this.voiceHandler,
      this.handleProcessingResult.bind(this)
    );

    const dtmfHandler = new DTMFHandler(processingStrategy);
    this.messageChain = dtmfHandler;
  }

  async initialize(scriptId: string): Promise<void> {
    await this.ctx.connect();
    await this.voiceHandler.initialize();
    await this.voiceHandler.onEnter();

    const initialResult = await this.liveKitProcess.start(
      `/script/${scriptId}`
    );
    await this.drainAndPublish(initialResult);
  }

  private async drainAndPublish(
    result: ProcessingResult | undefined
  ): Promise<void> {
    while (result) {
      await this.handleProcessingResult(result);

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

  private setupEventHandlers(): void {
    this.ctx.room.on(RoomEvent.DataReceived, async (payload, participant) => {
      await handleError(
        async () => {
          const message = this.parseMessage(payload);
          const handled = await this.messageChain.handle(message);

          if (!handled) {
            console.log(`Unhandled message type: ${message.type}`);
          }
        },
        () => this.publishError("Processing failed, please try again")
      );
    });

    this.ctx.room.on(RoomEvent.Disconnected, async (participant) => {
      console.log("Room disconnected, call ended!", participant);
      // await this.voiceHandler.cleanup();
      // await this.handleParticipantDisconnected(participant);
    });

    this.ctx.room.on(RoomEvent.ParticipantDisconnected, async (p) => {
      console.log("Participant disconnected:", p.identity);
      await this.handleParticipantDisconnected(p);
    });

    this.ctx.room.on(RoomEvent.TrackPublished, (track) => {
      console.log("Track published:", track);
    });
  }

  private parseMessage(payload: Uint8Array): MessageData {
    return JSON.parse(new TextDecoder().decode(payload));
  }

  private async handleProcessingResult(
    result: ProcessingResult | undefined
  ): Promise<void> {
    if (!result) {
      this.publishError("No result from processing");
      await this.voiceHandler.onExit();
      return;
    }

    if (result.output) {
      if (result.output.type === "recording") {
        if (result.output.recordingStarted && result.output.egressId) {
          this.activeRecordingEgressId = result.output.egressId;
        }
      }

      if (result.output.message) {
        await this.voiceHandler.onMessage(result.output.message);
      }

      console.log("Result output:=======>", result.output);
      this.publishData(result.output);
      return;
    }

    if (result.error) {
      console.log("Error:", result.error);
      this.publishError(result.error);
      await this.voiceHandler.onExit();
      this.ctx.room?.disconnect();
      return;
    }
  }

  private async handleParticipantDisconnected(participant: any): Promise<void> {
    console.log("Participant disconnected:", participant.identity);

    if (this.activeRecordingEgressId) {
      console.log("Stopping recording", {
        egressId: this.activeRecordingEgressId,
        participantIdentity: participant.identity,
      });

      const serviceManager = this.liveKitProcess.getServiceManager();
      const recordingClient = serviceManager.getRecordingClient();

      await handleError(
        async () => {
          await recordingClient.stopRecording(this.activeRecordingEgressId!);
          console.log(`Recording stopped: ${this.activeRecordingEgressId}`);
          this.activeRecordingEgressId = undefined;
        },
        (error) =>
          console.error("Failed to stop recording on disconnect:", error)
      );
    }
    this.ctx.room.disconnect();
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

  addMessageHandler(handler: MessageHandler): void {
    let current = this.messageChain;
    while (current && (current as any).nextHandler) {
      current = (current as any).nextHandler;
    }
    if (current) {
      current.setNext(handler);
    }
  }
}
