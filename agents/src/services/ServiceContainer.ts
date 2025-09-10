export interface ServiceContainer {
  get<T>(token: string): T;
  register<T>(token: string, implementation: T): void;
  has(token: string): boolean;
  clear(): void;
}

export class SimpleServiceContainer implements ServiceContainer {
  private services = new Map<string, any>();

  register<T>(token: string, implementation: T): void {
    this.services.set(token, implementation);
  }

  get<T>(token: string): T {
    if (!this.has(token)) {
      throw new Error(`Service not found: ${token}`);
    }
    return this.services.get(token) as T;
  }

  has(token: string): boolean {
    return this.services.has(token);
  }

  clear(): void {
    this.services.clear();
  }
}

export const SERVICE_TOKENS = {
  RECORDING_CLIENT: 'RECORDING_CLIENT',
  HTTP_CLIENT: 'HTTP_CLIENT',
} as const;

export type ServiceToken = typeof SERVICE_TOKENS[keyof typeof SERVICE_TOKENS];