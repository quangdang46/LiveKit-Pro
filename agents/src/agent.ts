require("dotenv").config();
import {
  Worker,
  WorkerPermissions,
  JobRequest,
  WorkerOptions,
  initializeLogger,
} from "@livekit/agents";
import { JobType } from "@livekit/protocol";

initializeLogger({ pretty: true, level: "warn" });

async function handleJobRequest(job: JobRequest): Promise<void> {
  console.log("Received job assignment:", {
    id: job.id,
    room: job.room?.name,
    publisher: job.publisher?.identity,
    agentName: job.agentName,
  });

  try {
    console.log(`Agent will join room: ${job.room?.name}`);
    console.log(`Agent name: ${job.agentName}`);

    if (job.publisher) {
      console.log(`Publisher: ${job.publisher.identity}`);
    }

    await job.accept();
  } catch (error) {
    await job.reject();
    console.error("Error handling job request:", error);
    throw error;
  }
}

const computeLoad = (worker: Worker): Promise<number> => {
  return Promise.resolve(Math.min(worker.activeJobs.length / 10, 1.0));
};

const opts = new WorkerOptions({
  agent: "./dist/agent-process.js",
  requestFunc: handleJobRequest,
  loadFunc: computeLoad,
  loadThreshold: 0.9,
  permissions: new WorkerPermissions(),
  workerType: JobType.JT_ROOM,
  agentName: "livekit-ai-agent",

  wsURL: process.env.LIVEKIT_URL ?? "http://localhost:7880",
  apiKey: process.env.LIVEKIT_API_KEY ?? "devkey",
  apiSecret: process.env.LIVEKIT_API_SECRET ?? "secret",
});

const worker = new Worker(opts);

worker.event.on("error", (error: Error) => {
  console.error("Worker error:", error);
});

worker.event.on("disconnected", () => {
  console.log("Worker disconnected from LiveKit server");
});

worker.event.on("connected", () => {
  console.log("Worker connected to LiveKit server");
});

console.log("Starting LiveKit Agent Worker...");

(async () => {
  try {
    await worker.run();
  } catch (err) {
    console.error("Failed to start worker:", err);
  }
})();
