import { defineAgent, JobContext } from "@livekit/agents";
import { LiveKitProcess } from "../processors/LiveKitProcess";
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

    const liveKitProcess = new LiveKitProcess();
    const initialResult = await liveKitProcess.start(
      `/script/${metadata.scriptId}`
    );

    if (initialResult?.output) {
      ctx.room?.localParticipant?.publishData(
        new TextEncoder().encode(JSON.stringify(initialResult.output)),
        { reliable: true }
      );
    }

    ctx.room.on("dataReceived", async (payload, participant) => {
      const msg = JSON.parse(new TextDecoder().decode(payload));
      console.log("Agent received data", {
        msg,
        from: participant?.identity,
      });

      try {
        if (msg.type === "dtmf") {
          const result = await liveKitProcess.handleInput(msg.digit);
          console.log("Processing result:", result);

          if (result?.output) {
            ctx.room?.localParticipant?.publishData(
              new TextEncoder().encode(JSON.stringify(result.output)),
              { reliable: true }
            );
          }

          if (!result?.success && result?.output) {
            ctx.room?.localParticipant?.publishData(
              new TextEncoder().encode(JSON.stringify(result.output)),
              { reliable: true }
            );
          } else if (!result?.success && result?.error) {
            console.error("Processing error:", result.error);
            ctx.room?.localParticipant?.publishData(
              new TextEncoder().encode(
                JSON.stringify({
                  type: "error",
                  message: result.error,
                })
              ),
              { reliable: true }
            );
          }
        }
      } catch (error) {
        console.error("Handler error:", error);
        ctx.room?.localParticipant?.publishData(
          new TextEncoder().encode(
            JSON.stringify({
              type: "error",
              message: "Processing failed, please try again",
            })
          ),
          { reliable: true }
        );
      }
    });
  },
});
