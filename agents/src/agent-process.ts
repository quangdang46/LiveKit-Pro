import { defineAgent, JobContext } from "@livekit/agents";

module.exports = defineAgent({
  entry: async (ctx: JobContext) => {
    console.log("Agent process started");

    await ctx.connect();
    console.log("Agent process connected to the room", ctx.room.name);
  },
});
