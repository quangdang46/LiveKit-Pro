import { defineAgent, JobContext } from "@livekit/agents";
type Metadata = {
  scriptId: string;
};

export default defineAgent({
  entry: async (ctx: JobContext) => {
    // console.log("Agent process started JOB", {
    //   id: ctx.job.id,
    //   type: ctx.job.type,
    // });

    // console.log("Agent process started AGENT", {
    //   agentName: ctx.job.agentName,
    // });

    // console.log("Agent process started PARTICIPANT", {
    //   sid: ctx.job.participant?.sid,
    //   identity: ctx.job.participant?.identity,
    // });

    console.log("Agent process started METADATA", {
      metadata: ctx.job.metadata,
    });

    const metadata = JSON.parse(ctx.job.metadata) as Metadata;
    console.log("Agent process started scriptId", {
      scriptId: metadata.scriptId,
    });


    await ctx.connect();

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
