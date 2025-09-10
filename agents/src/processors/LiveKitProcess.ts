import { HttpClient } from "../http/HttpClient";
import { RecordingClient } from "../http/RecordingClient";
import { Script } from "../types";
import { ScriptProcessor } from "./ScriptProcessor";
import { TTSService } from "../services/TTSService";

export class LiveKitProcess {
  private readonly httpClient: HttpClient;
  private scriptProcessor?: ScriptProcessor;
  private ttsService: TTSService;
  private recordingClient: RecordingClient;

  constructor() {
    this.httpClient = new HttpClient();
    this.ttsService = new TTSService();
    this.recordingClient = new RecordingClient();
  }

  async start(endpoint: string) {
    const script = await this.httpClient.get<Script>(`${endpoint}`);

    this.scriptProcessor = new ScriptProcessor(
      script,
      this.ttsService,
      this.recordingClient
    );
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
