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
  currentRooms: string;
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
    return Promise.resolve(0.5);
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
      currentRooms: "",
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
        agent.currentRooms = "";
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

  private async loadBalance(): Promise<AgentInstance> {
    let availableAgent = Array.from(this.agents.values()).find(
      (a) => a.isAvailable
    );

    if (!availableAgent) {
      console.log("No available agents, creating new one");
      const newInstanceId = `new-${Date.now()}`;
      const newAgent = this.createAgentInstance(newInstanceId);
      this.agents.set(newInstanceId, newAgent);

      try {
        await newAgent.worker.run();
        console.log(`Spawned and connected new agent: ${newInstanceId}`);
      } catch (error) {
        console.error(`Failed to start agent ${newInstanceId}:`, error);
        throw error;
      }

      availableAgent = newAgent;
    }

    console.log(
      `===========>Agent ${availableAgent.id} is available, accepting job`
    );
    return availableAgent;
  }

  private async handleJobRequest(
    job: JobRequest,
    instanceId: string
  ): Promise<void> {
    let agent = this.agents.get(instanceId);
    if (!agent) return;

    console.log(`Agent ${instanceId} received job. room=${job.room?.name}`);

    if (!agent.isAvailable) {
      const availableAgent = await this.loadBalance();
      agent = availableAgent;
    }

    try {
      console.log(
        `Agent ${instanceId} accepting job for room: ${job.room?.name}`
      );

      agent.isAvailable = false;
      agent.lastJobTime = new Date();
      if (job.room?.name) {
        agent.currentRooms = job.room.name;
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
      agent.currentRooms = "";
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
}
