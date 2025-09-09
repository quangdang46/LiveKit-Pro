import dotenv from "dotenv";
dotenv.config();
import { Agent } from "./agent-process/Agent";
async function main() {
  const agentPool = new Agent(2, "ai-agent");
  await agentPool.initialize();
}

main().catch(console.error);
