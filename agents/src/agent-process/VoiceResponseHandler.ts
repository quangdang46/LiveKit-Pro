import { type JobContext, voice } from "@livekit/agents";
import * as cartesia from "@livekit/agents-plugin-cartesia";
import * as deepgram from "@livekit/agents-plugin-deepgram";
import * as google from "@livekit/agents-plugin-google";

export class VoiceResponseHandler {
  private voiceSession?: voice.AgentSession;
  private voiceAssistant?: voice.Agent;
  private ctx: JobContext;

  constructor(ctx: JobContext) {
    this.ctx = ctx;
  }

  async initialize(): Promise<void> {
    try {
      this.voiceAssistant = new voice.Agent({
        instructions:
          "You are a helpful voice AI assistant for an interactive voice response system.",
      });

      this.voiceSession = new voice.AgentSession({
        stt: new deepgram.STT({
          model: "nova-3",
          language: "multi",
        }),
        llm: new google.LLM({
          model: "gemini-2.0-flash-001",
          apiKey: process.env.GOOGLE_API_KEY!,
          temperature: 0.7,
        }),
        tts: new cartesia.TTS({
          model: "sonic-2",
          voice: "f786b574-daa5-4673-aa0c-cbe3e8534c02",
        }),
      });

      await this.voiceSession.start({
        agent: this.voiceAssistant,
        room: this.ctx.room,
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
