import { defineAgent, JobContext, JobProcess } from "@livekit/agents";
import * as silero from "@livekit/agents-plugin-silero";
import { Metadata } from "../types";
import { AgentServiceFacade } from "./patterns/facade/AgentServiceFacade";

class AgentHandler {
  private facade: AgentServiceFacade;

  constructor(ctx: JobContext, vad: silero.VAD) {
    this.facade = new AgentServiceFacade(ctx, vad);
  }

  async initialize(scriptId: string): Promise<void> {
    await this.facade.initialize(scriptId);
  }
}

export default defineAgent({
  prewarm: async (proc: JobProcess) => {
    proc.userData.vad = await silero.VAD.load();
  },
  entry: async (ctx: JobContext) => {
    const vad = ctx.proc.userData.vad! as silero.VAD;
    const metadata = JSON.parse(ctx.job.metadata) as Metadata;
    const handler = new AgentHandler(ctx, vad);
    await handler.initialize(metadata.scriptId);
  },
});