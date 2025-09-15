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
          apiKey: process.env.CARTESIA_API_KEY!,
          model: "sonic-2",
          chunkTimeout: 30000,
        }),
      });

      await this.voiceSession.start({
        agent: this.voiceAssistant,
        room: this.ctx.room,
        inputOptions: {
          noiseCancellation: BackgroundVoiceCancellation(),
        },
        outputOptions: {
          audioEnabled: true,
          transcriptionEnabled: false,
        },
      });

      // stt
      this.voiceSession.on(
        voice.AgentSessionEventTypes.UserInputTranscribed,
        (ev) => {
          console.log("Transcript:", ev);
        }
      );

      // llm
      this.voiceSession.on(
        voice.AgentSessionEventTypes.ConversationItemAdded,
        (ev) => {
          console.log("LLM response:", ev.item.content);
        }
      );
    } catch (error) {
      console.error("Failed to initialize VoiceResponseHandler:", error);
      throw error;
    }
  }

  async onEnter(): Promise<void> {
    // this.voiceSession?.generateReply({
    //   instructions: "Say exactly: 'Hello, how can I help you today?'",
    // });
    await this.speak("Hello, how can I help you today?");
  }

  async onExit(): Promise<void> {
    await this.speak("Tell the user a friendly goodbye before you exit.");
  }

  async onMessage(message: string): Promise<void> {
    // this.voiceSession?.generateReply({
    //   instructions: `Say exactly: "${message}"`,
    // });
    await this.speak(message);
  }

  isInitialized(): boolean {
    return !!this.voiceSession && !!this.voiceAssistant;
  }

  private async speak(
    message: string,
    options?: { allowInterruptions?: boolean }
  ): Promise<void> {
    options = options || { allowInterruptions: true };
    const speechHandle = this.voiceSession?.say(message, options);
    await speechHandle?.waitForPlayout();
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
