import OpenAI from "openai";

export class TTSService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateSpeech(text: string): Promise<Buffer> {
    const response = await this.client.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input: text,
    });

    return Buffer.from(await response.arrayBuffer());
  }

  async generateBeep(): Promise<Buffer> {
    return await this.generateSpeech("Beep");
  }
}
