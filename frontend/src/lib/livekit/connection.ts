import { Room } from "livekit-client";
import { removeAudioElement } from "@/lib/livekit/audio";

export async function connectToRoom(
  room: Room,
  serverUrl: string,
  token: string
): Promise<void> {
  await room.connect(serverUrl, token);
}

export function disconnectFromRoom(
  room: Room | null,
  audioEl: HTMLAudioElement | null
): void {
  if (!room) return;
  try {
    room.disconnect();
    room.removeAllListeners?.();
  } finally {
    removeAudioElement(audioEl);
  }
}
