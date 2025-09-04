import { defineAgent, JobContext } from "@livekit/agents";

export default defineAgent({
  entry: async (ctx: JobContext) => {
    console.log("Agent process started");

    // connect to the room
    await ctx.connect();
    // handle the session
    console.log("Agent process connected to the room", ctx.room.name);
  },
});
