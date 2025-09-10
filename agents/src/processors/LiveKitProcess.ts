import { Script } from "../types";
import { ScriptProcessor } from "./ScriptProcessor";
import { ServiceManager } from "../services/ServiceManager";
import { SimpleServiceContainer } from "../services/ServiceContainer";

export class LiveKitProcess {
  private readonly serviceManager: ServiceManager;
  private scriptProcessor?: ScriptProcessor;

  constructor() {
    const container = new SimpleServiceContainer();
    this.serviceManager = new ServiceManager(container);
    this.serviceManager.initialize();
  }

  async start(endpoint: string) {
    const httpClient = this.serviceManager.getHttpClient();
    const script = await httpClient.get<Script>(`${endpoint}`);

    this.scriptProcessor = new ScriptProcessor(script, this.serviceManager);
    const result = await this.scriptProcessor.start();
    return result;
  }

  async handleInput(input: any) {
    if (!this.scriptProcessor) {
      throw new Error("Script processor not initialized");
    }
    return await this.scriptProcessor.handleInput(input);
  }

  getServiceManager() {
    return this.serviceManager;
  }
}
