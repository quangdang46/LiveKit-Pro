import { defineAgent, JobContext } from "@livekit/agents";

module.exports = defineAgent({
  entry: async (ctx: JobContext) => {
    console.log("Agent process started", ctx.job.metadata);

    await ctx.connect();
    console.log("Agent process connected to the room", ctx.room.name);

    ctx.room.on("trackPublished", (track, participant) => {
      console.log(
        `New track published by ${participant.identity}: ${track.name}`
      );
    });

    ctx.room.on("trackUnpublished", (track, participant) => {
      console.log(
        `Track unpublished by ${participant.identity}: ${track.name}`
      );
    });

    ctx.room.on("participantConnected", (participant) => {
      console.log(`${participant.identity} joined the room`);
    });
  },
});
