import { HttpClient } from "./HttpClient";
import { Script } from "./types";
import { ScriptProcessor } from "./ScriptProcessor";

export class LiveKitProcess {
  private readonly httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient();
  }

  async start(scriptId: string) {
    const script = await this.httpClient.get<Script>(`/script/${scriptId}`);
    console.log("script", script);

    const scriptProcessor = new ScriptProcessor(script);
    await scriptProcessor.start();
  }
}
