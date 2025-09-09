import dotenv from "dotenv";
dotenv.config();
import { AgentPool } from "./agent-process/agent-pool";
async function main() {
  const agentPool = new AgentPool(2, "ai-agent");
  await agentPool.initialize();
}

main().catch(console.error);
