import { ExecutionContext } from '../types/context';
import { ServiceManager } from '../services/ServiceManager';
import { ProcessorServices } from './NodeProcessor';

export class ProcessorContext {
  private executionContext: ExecutionContext;
  private serviceManager: ServiceManager;

  constructor(executionContext: ExecutionContext, serviceManager: ServiceManager) {
    this.executionContext = executionContext;
    this.serviceManager = serviceManager;
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
}