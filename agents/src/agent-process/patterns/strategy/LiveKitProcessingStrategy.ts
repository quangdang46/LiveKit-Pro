import { LiveKitProcess } from "../../../processors/LiveKitProcess";
import { ProcessingResult } from "../../../types/context";
import { VoiceResponseHandler } from "../services/VoiceResponseHandler";
import { IProcessingStrategy } from "./IProcessingStrategy";

export class LiveKitProcessingStrategy implements IProcessingStrategy {
  constructor(
    private liveKitProcess: LiveKitProcess,
    private voiceHandler: VoiceResponseHandler,
    private onResult: (result: ProcessingResult) => Promise<void>
  ) {}

  async process(input: any): Promise<void> {
    const result = await this.liveKitProcess.handleInput(input);

    if (result.isInterrupt) {
      console.log("Interrupt detected, handling...");
    }

    await this.drainAndPublish(result);
  }

  private async drainAndPublish(
    result: ProcessingResult | undefined
  ): Promise<void> {
    while (result) {
      await this.onResult(result);

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
}
