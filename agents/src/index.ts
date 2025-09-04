import { AgentPool } from "./agent-pool";

async function main() {
  const agentPool = new AgentPool(5, "ai-agent");
  await agentPool.initialize();
}

main().catch(console.error);
