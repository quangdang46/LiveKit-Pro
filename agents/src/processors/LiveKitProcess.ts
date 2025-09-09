import { HttpClient } from "../http/HttpClient";
import { Script } from "../types";
import { ScriptProcessor } from "./ScriptProcessor";

export class LiveKitProcess {
  private readonly httpClient: HttpClient;
  private scriptProcessor?: ScriptProcessor;

  constructor() {
    this.httpClient = new HttpClient();
  }

  async start(endpoint: string) {
    const script = await this.httpClient.get<Script>(`${endpoint}`);

    this.scriptProcessor = new ScriptProcessor(script);
    const result = await this.scriptProcessor.start();
    return result;
  }

  async handleInput(input: any) {
    if (!this.scriptProcessor) {
      throw new Error("Script processor not initialized");
    }
    return await this.scriptProcessor.handleInput(input);
  }

  getScriptProcessor() {
    return this.scriptProcessor;
  }
}
