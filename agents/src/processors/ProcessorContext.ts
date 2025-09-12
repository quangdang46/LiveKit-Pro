import { ExecutionContext } from '../types/context';
import { ServiceManager } from '../services/ServiceManager';
import { ProcessorServices } from './NodeProcessor';
import { type JobContext } from '@livekit/agents';

export class ProcessorContext {
  private executionContext: ExecutionContext;
  private serviceManager: ServiceManager;
  private jobContext?: JobContext;

  constructor(executionContext: ExecutionContext, serviceManager: ServiceManager, jobContext?: JobContext) {
    this.executionContext = executionContext;
    this.serviceManager = serviceManager;
    this.jobContext = jobContext;
  }

  getExecutionContext(): ExecutionContext {
    return this.executionContext;
  }

  updateContext(updates: Partial<ExecutionContext>): void {
    this.executionContext = { ...this.executionContext, ...updates };
  }

  getServices(): ProcessorServices {
    return this.serviceManager.getProcessorServices();
  }

  getServiceManager(): ServiceManager {
    return this.serviceManager;
  }

  getJobContext(): JobContext | undefined {
    return this.jobContext;
  }

  setJobContext(jobContext: JobContext): void {
    this.jobContext = jobContext;
  }
}