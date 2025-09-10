import { HttpClient } from "./HttpClient";

export class RecordingClient extends HttpClient {
  constructor() {
    super();
  }

  async startRecording(
    roomName: string,
    participantId: string,
    maxDuration = 60
  ) {
    return this.post("/recording/start", {
      roomName,
      participantId,
      maxDuration,
    });
  }

  async stopRecording(egressId: string) {
    return this.post("/recording/stop", { egressId });
  }
}
