import { defineAgent, JobContext } from "@livekit/agents";
type Metadata = {
  scriptId: string;
};

export default defineAgent({
  entry: async (ctx: JobContext) => {
    const metadata = JSON.parse(ctx.job.metadata) as Metadata;
    console.log("Agent process started scriptId", {
      scriptId: metadata.scriptId,
    });

    await ctx.connect();

    ctx.room.on("dataReceived", (payload, participant) => {
      const msg = JSON.parse(new TextDecoder().decode(payload));
      console.log("Agent received data", {
        msg,
        from: participant?.identity,
      });

      // HANDLE DTMF
      if (msg.type === "dtmf") {
        // const nextNode = handleDTMF(script, msg.digit);
        // console.log("Next node", nextNode);

        // Optionally gửi phản hồi ngược về client
        ctx.room?.localParticipant?.publishData(
          new TextEncoder().encode(
            // JSON.stringify({ type: "ivr", node: nextNode })
            JSON.stringify({ type: "ivr", node: "nextNode" })
          ),
          { reliable: true }
        );
      }
    });
  },
});
