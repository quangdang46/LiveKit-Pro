import { ServiceContainer, SERVICE_TOKENS } from './ServiceContainer';
import { RecordingClient } from '../http/RecordingClient';
import { HttpClient } from '../http/HttpClient';
import { ProcessorServices } from '../processors/NodeProcessor';

export class ServiceManager {
  private container: ServiceContainer;

  constructor(container: ServiceContainer) {
    this.container = container;
  }

  initialize(): void {
    this.container.register(SERVICE_TOKENS.RECORDING_CLIENT, new RecordingClient());
    this.container.register(SERVICE_TOKENS.HTTP_CLIENT, new HttpClient());
  }

  getProcessorServices(): ProcessorServices {
    return {
      recordingClient: this.container.get<RecordingClient>(SERVICE_TOKENS.RECORDING_CLIENT),
    };
  }

  getRecordingClient(): RecordingClient {
    return this.container.get<RecordingClient>(SERVICE_TOKENS.RECORDING_CLIENT);
  }

  getHttpClient(): HttpClient {
    return this.container.get<HttpClient>(SERVICE_TOKENS.HTTP_CLIENT);
  }

}