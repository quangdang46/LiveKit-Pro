import { HttpClient } from "./HttpClient";
import { RecordingResponse } from "../types";

export class RecordingClient extends HttpClient {
  constructor() {
    super();
  }

  async startRecording(
    roomName: string,
    participantId: string,
    maxDuration = 60
  ): Promise<RecordingResponse> {

    try {
      const response = await this.post<RecordingResponse>("/recording/start", {
        roomName,
        participantId,
        maxDuration,
      });

      console.log("======>Recording request successful:", response);
      return response;
    } catch (error) {
      console.error("Recording request failed:", error);
      throw error;
    }
  }

  async stopRecording(egressId: string) {
    console.log(
      "Stopping recording request to backend...",
      {
        egressId,
        endpoint: "/recording/stop",
      }
    );

    try {
      const response = await this.post("/recording/stop", { egressId });
      console.log(
        "Stop recording request successful:",
        response
      );
      return response;
    } catch (error) {
      console.error(
        "Stop recording request failed:",
        error
      );
      throw error;
    }
  }
}
