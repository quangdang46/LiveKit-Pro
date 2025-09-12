import { type JobContext, voice } from "@livekit/agents";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as google from "@livekit/agents-plugin-google";
import * as silero from "@livekit/agents-plugin-silero";
import * as livekit from "@livekit/agents-plugin-livekit";
import { BackgroundVoiceCancellation } from "@livekit/noise-cancellation-node";
export class VoiceResponseHandler {
  private voiceSession?: voice.AgentSession;
  private voiceAssistant?: voice.Agent;
  private ctx: JobContext;
  private vad: silero.VAD;

  constructor(ctx: JobContext, vad: silero.VAD) {
    this.ctx = ctx;
    this.vad = vad;
  }

  async initialize(): Promise<void> {
    try {
      this.voiceAssistant = new voice.Agent({
        instructions:
          "You are a helpful voice AI assistant for an interactive voice response system.",
      });

      console.log("vad", this.vad);
      this.voiceSession = new voice.AgentSession({
        vad: this.vad,
        stt: new deepgram.STT({
          model: "nova-3",
          apiKey: process.env.DEEPGRAM_API_KEY!,
        }),
        llm: new google.LLM({
          model: "gemini-2.0-flash-001",
          apiKey: process.env.GOOGLE_API_KEY!,
        }),

        tts: new cartesia.TTS({
          model: "sonic-2",
          apiKey: process.env.CARTESIA_API_KEY!,
          voice: "f786b574-daa5-4673-aa0c-cbe3e8534c02",
          chunkTimeout: 60000,
        }),

        turnDetection: new livekit.turnDetector.MultilingualModel(),
      });

      await this.voiceSession.start({
        agent: this.voiceAssistant,
        room: this.ctx.room,
        inputOptions: {
          noiseCancellation: BackgroundVoiceCancellation(),
        },
      });

      console.log("VoiceResponseHandler initialized successfully");
    } catch (error) {
      console.error("Failed to initialize VoiceResponseHandler:", error);
      throw error;
    }
  }

  async speakMessage(message: string): Promise<void> {
    if (!this.voiceSession) {
      console.error("Voice session not initialized");
      return;
    }

    try {
      this.voiceSession.generateReply({
        instructions: `Say exactly: "${message}"`,
      });
    } catch (error) {
      console.error("Failed to generate voice reply:", error);
    }
  }

  isInitialized(): boolean {
    return !!this.voiceSession && !!this.voiceAssistant;
  }

  async cleanup(): Promise<void> {
    try {
      if (this.voiceSession) {
        await this.voiceSession.close();
        this.voiceSession = undefined;
      }

      this.voiceAssistant = undefined;
      console.log("VoiceResponseHandler cleaned up successfully");
    } catch (error) {
      console.error("Error during VoiceResponseHandler cleanup:", error);
    }
  }
}
