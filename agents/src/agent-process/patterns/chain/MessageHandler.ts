import { MessageData } from "../../../types";

export abstract class MessageHandler {
  protected nextHandler?: MessageHandler;

  setNext(handler: MessageHandler): MessageHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(message: MessageData): Promise<boolean> {
    if (await this.canHandle(message)) {
      await this.process(message);
      return true;
    }

    if (this.nextHandler) {
      return await this.nextHandler.handle(message);
    }

    return false;
  }

  protected abstract canHandle(message: MessageData): Promise<boolean>;
  protected abstract process(message: MessageData): Promise<void>;
}