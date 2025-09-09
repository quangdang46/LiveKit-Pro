import {
  Worker,
  WorkerPermissions,
  JobRequest,
  WorkerOptions,
  initializeLogger,
} from "@livekit/agents";
import { JobType } from "@livekit/protocol";

initializeLogger({ pretty: true, level: "info" });

type AgentInstance = {
  id: string;
  worker: Worker;
  isAvailable: boolean;
  currentRoom?: string;
  lastJobTime: Date;
};

export class AgentPool {
  private agents: Map<string, AgentInstance> = new Map();
  private readonly maxAgents: number;
  private readonly agentPrefix: string;

  constructor(maxAgents: number = 5, agentPrefix: string = "ai-agent") {
    this.maxAgents = maxAgents;
    this.agentPrefix = agentPrefix;
  }

  private computeLoad(): Promise<number> {
    return Promise.resolve(0.5);
  }

  private createAgentInstance(instanceSuffix: string): AgentInstance {
    const agentId = `${this.agentPrefix}-${instanceSuffix}`;

    const opts = new WorkerOptions({
      agent: "./dist/agent-process/agent-process.js",
      requestFunc: (job: JobRequest) => this.handleJobRequest(job, agentId),
      loadFunc: () => this.computeLoad(),
      loadThreshold: 0.8,
      permissions: new WorkerPermissions(),
      workerType: JobType.JT_PARTICIPANT,
      agentName: agentId,

      wsURL: process.env.LIVEKIT_URL ?? "ws://localhost:7880",
      apiKey: process.env.LIVEKIT_API_KEY ?? "devkey",
      apiSecret: process.env.LIVEKIT_API_SECRET ?? "secret",
    });

    const worker = new Worker(opts);
    this.setupWorkerEvents(worker, agentId);

    return {
      id: agentId,
      worker,
      isAvailable: true,
      currentRoom: undefined,
      lastJobTime: new Date(),
    };
  }

  private setupWorkerEvents(worker: Worker, agentId: string): void {
    worker.event.on("connected", () => {
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.isAvailable = true;
      }
    });

    worker.event.on("disconnected", () => {
      console.log(`Agent ${agentId} disconnected`);
      const agent = this.agents.get(agentId);
      if (agent) {
        agent.isAvailable = true;
        agent.currentRoom = undefined;
      }
    });

    worker.event.on("error", (error: Error) => {
      console.error(`Agent ${agentId} error:`, error);
      setTimeout(() => this.restartAgent(agentId), 5000);
    });
  }

  private async restartAgent(agentId: string): Promise<void> {
    const oldAgent = this.agents.get(agentId);
    if (oldAgent) {
      oldAgent.worker.close();
      this.agents.delete(agentId);
    }

    const newAgent = this.createAgentInstance(
      agentId.replace(`${this.agentPrefix}-`, "")
    );
    this.agents.set(newAgent.id, newAgent);

    try {
      await newAgent.worker.run();
    } catch (error) {
      console.error(`Failed to restart agent ${agentId}:`, error);
    }
  }

  private async loadBalance(): Promise<AgentInstance> {
    let availableAgent = Array.from(this.agents.values()).find(
      (a) => a.isAvailable && !a.currentRoom
    );
    if (!availableAgent) {
      const newSuffix = `new-${Date.now()}`;
      const newAgent = this.createAgentInstance(newSuffix);
      this.agents.set(newAgent.id, newAgent);

      try {
        await newAgent.worker.run();
      } catch (error) {
        console.error(`Failed to start agent ${newAgent.id}:`, error);
        throw error;
      }

      availableAgent = newAgent;
    }

    return availableAgent;
  }

  private async handleJobRequest(
    job: JobRequest,
    agentId: string
  ): Promise<void> {
    let agent = this.agents.get(agentId);

    if (!agent || !agent.isAvailable || agent.currentRoom) {
      agent = await this.loadBalance();
      agentId = agent.id;
    }

    try {
      console.log(`Agent ${agentId} accepting job for room: ${job.room?.name}`);

      agent.isAvailable = false;
      agent.lastJobTime = new Date();
      if (job.room?.name) {
        agent.currentRoom = job.room.name;
      }

      await job.accept();

      console.log(
        `Agent ${agentId} successfully joined room: ${job.room?.name}`
      );
    } catch (error) {
      console.error(
        `Agent ${agentId} failed to accept job for room ${job.room?.name}.`,
        error
      );
      await job.reject();

      agent.isAvailable = true;
      agent.currentRoom = undefined;
    }
  }

  async initialize(): Promise<void> {
    for (let i = 1; i <= this.maxAgents; i++) {
      const suffix = i.toString().padStart(3, "0");
      const agent = this.createAgentInstance(suffix);
      this.agents.set(agent.id, agent);

      try {
        agent.worker.run();
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to start agent ${agent.id}:`, error);
      }
    }
  }

  async shutdown(): Promise<void> {
    for (const agent of this.agents.values()) {
      agent.worker.close();
    }
    this.agents.clear();
  }
}
