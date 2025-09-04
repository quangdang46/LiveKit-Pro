require("dotenv").config();
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
  currentRooms: Set<string>;
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

  private computeLoad(instanceId: string): Promise<number> {
    const agent = this.agents.get(instanceId);
    if (!agent) return Promise.resolve(1.0);
    const load = agent.currentRooms.size / 2;
    return Promise.resolve(Math.min(load, 1.0));
  }

  private createAgentInstance(instanceId: string): AgentInstance {
    const agentName = `${this.agentPrefix}-${instanceId.padStart(3, "0")}`;

    console.log(`Creating agent instance: ${agentName}`);
    const opts = new WorkerOptions({
      agent: "./dist/agent-process.js",
      requestFunc: (job: JobRequest) => this.handleJobRequest(job, instanceId),
      loadFunc: () => this.computeLoad(instanceId),
      loadThreshold: 0.8,
      permissions: new WorkerPermissions(),
      workerType: JobType.JT_PARTICIPANT,
      agentName: agentName,

      wsURL: process.env.LIVEKIT_URL ?? "ws://localhost:7880",
      apiKey: process.env.LIVEKIT_API_KEY ?? "devkey",
      apiSecret: process.env.LIVEKIT_API_SECRET ?? "secret",
    });

    const worker = new Worker(opts);

    this.setupWorkerEvents(worker, instanceId);

    const agentInstance: AgentInstance = {
      id: instanceId,
      worker,
      isAvailable: true,
      currentRooms: new Set(),
      lastJobTime: new Date(),
    };

    return agentInstance;
  }

  private setupWorkerEvents(worker: Worker, instanceId: string): void {
    worker.event.on("connected", () => {
      const agent = this.agents.get(instanceId);
      if (agent) {
        agent.isAvailable = true;
      }
    });

    worker.event.on("disconnected", () => {
      console.log(`Agent ${instanceId} disconnected`);
      const agent = this.agents.get(instanceId);
      if (agent) {
        agent.isAvailable = false;
      }
    });

    worker.event.on("error", (error: Error) => {
      console.error(`Agent ${instanceId} error:`, error);
      setTimeout(() => this.restartAgent(instanceId), 5000);
    });
  }

  private async restartAgent(instanceId: string): Promise<void> {
    const oldAgent = this.agents.get(instanceId);
    if (oldAgent) {
      oldAgent.worker.close();
      this.agents.delete(instanceId);
    }

    const newAgent = this.createAgentInstance(instanceId);
    this.agents.set(instanceId, newAgent);

    try {
      await newAgent.worker.run();
      console.log(`Agent ${instanceId} restarted successfully`);
    } catch (error) {
      console.error(`Failed to restart agent ${instanceId}:`, error);
    }
  }

  private async handleJobRequest(
    job: JobRequest,
    instanceId: string
  ): Promise<void> {
    const agent = this.agents.get(instanceId);
    if (!agent) return;

    console.log(`Agent ${instanceId} received job. room=${job.room?.name}`);

    if (!agent.isAvailable || agent.currentRooms.size >= 2) {
      console.log(
        `Agent ${instanceId} is busy (rooms=${agent.currentRooms.size}), rejecting job for room ${job.room?.name}`
      );
      await job.reject();
      return;
    }

    try {
      console.log(
        `Agent ${instanceId} accepting job for room: ${job.room?.name}`
      );

      agent.isAvailable = false;
      agent.lastJobTime = new Date();
      if (job.room?.name) {
        agent.currentRooms.add(job.room.name);
      }

      await job.accept();

      console.log(
        `Agent ${instanceId} successfully joined room: ${job.room?.name}`
      );
    } catch (error) {
      console.error(
        `Agent ${instanceId} failed to accept job for room ${job.room?.name}.`,
        error
      );
      await job.reject();

      agent.isAvailable = true;
      if (job.room?.name) {
        agent.currentRooms.delete(job.room.name);
      }
    }
  }

  async initialize(): Promise<void> {
    for (let i = 1; i <= this.maxAgents; i++) {
      const instanceId = i.toString().padStart(3, "0");

      const agent = this.createAgentInstance(instanceId);
      this.agents.set(instanceId, agent);

      try {
        agent.worker.run();

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Failed to start agent ${instanceId}:`, error);
      }
    }
  }

  async shutdown(): Promise<void> {
    for (const agent of this.agents.values()) {
      agent.worker.close();
    }

    this.agents.clear();
  }

  // Get pool status
  getPoolStatus() {
    const agents = Array.from(this.agents.values());

    return {
      totalAgents: agents.length,
      availableAgents: agents.filter((a) => a.isAvailable).length,
      busyAgents: agents.filter((a) => !a.isAvailable).length,
      totalRooms: agents.reduce((sum, a) => sum + a.currentRooms.size, 0),
      agents: agents.map((a) => ({
        id: a.id,
        available: a.isAvailable,
        rooms: Array.from(a.currentRooms),
        lastJob: a.lastJobTime,
      })),
    };
  }
}
