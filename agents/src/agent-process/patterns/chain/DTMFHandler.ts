import { MessageData } from "../../../types";
import { MessageHandler } from "./MessageHandler";
import { IProcessingStrategy } from "../strategy/IProcessingStrategy";

export class DTMFHandler extends MessageHandler {
  constructor(private processingStrategy: IProcessingStrategy) {
    super();
  }

  protected async canHandle(message: MessageData): Promise<boolean> {
    return message.type === "dtmf" && !!message.digit;
  }

  protected async process(message: MessageData): Promise<void> {
    if (!message.digit) {
      console.error("No digit received in DTMF message");
      return;
    }

    try {
      const input = {
        digit: message.digit,
        roomName: message.roomName,
        participantId: message.participantId,
      };

      await this.processingStrategy.process(input);
    } catch (error) {
      console.error("Error processing DTMF message:", error);
      throw error;
    }
  }
}