import {
  Participant,
  RemoteAudioTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";

import { removeAudioElement } from "@/lib/livekit/audio";

type Handlers = {
  onLog: (entry: string) => void;
  onPlayBeep: () => void;
  onDisconnected: () => void;
  audioEl: HTMLAudioElement | null;
};

export function registerRoomEventHandlers(
  room: Room,
  handlers: Handlers
): () => void {
  const { onLog, onPlayBeep, onDisconnected, audioEl } = handlers;

  const onDataReceived = (
    payload: Uint8Array,
    participant?: RemoteParticipant
  ) => {
    const decoder = new TextDecoder();
    const payloadString = decoder.decode(payload);

    try {
      const msg = JSON.parse(payloadString) as {
        message?: string;
        type?: string;
        playBeep?: boolean;
      };

      if (msg.type === "recording" && msg.playBeep) {
        onLog("Playing beep file");
        onPlayBeep();
      }

      const timestamp = new Date().toLocaleString();
      const logMessage = msg.message || `${msg.type} event`;
      onLog(`[${timestamp}]\n${logMessage}\n\n`);
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  };

  const onParticipantDisconnected = (participant: Participant) => {
    console.log("Participant disconnected", participant);
  };

  const onRoomDisconnected = () => {
    console.log("Agent: Call ended room disconnected");
    removeAudioElement(audioEl);
    onDisconnected();
  };

  const onTrackSubscribed = (
    track: RemoteTrack,
    pub: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    if (
      track.kind === Track.Kind.Audio &&
      participant.identity.includes("agent")
    ) {
      console.log("Subscribed to agent audio:", {
        participant: participant.identity,
        trackSid: pub.trackSid,
      });
      (track as RemoteAudioTrack).attach(audioEl!);
    }
  };

  const onTrackUnsubscribed = (
    track: RemoteTrack,
    pub: RemoteTrackPublication,
    participant: RemoteParticipant
  ) => {
    if (
      track.kind === Track.Kind.Audio &&
      participant.identity.includes("agent")
    ) {
      console.log("Unsubscribed from agent audio:", {
        participant: participant.identity,
        trackSid: pub.trackSid,
      });
      (track as RemoteAudioTrack).detach(audioEl!);
    }
  };

  room.on(RoomEvent.DataReceived, onDataReceived);
  room.on(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
  room.on(RoomEvent.Disconnected, onRoomDisconnected);
  room.on(RoomEvent.TrackSubscribed, onTrackSubscribed);
  room.on(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);

  return () => {
    room.off(RoomEvent.DataReceived, onDataReceived);
    room.off(RoomEvent.ParticipantDisconnected, onParticipantDisconnected);
    room.off(RoomEvent.Disconnected, onRoomDisconnected);
    room.off(RoomEvent.TrackSubscribed, onTrackSubscribed);
    room.off(RoomEvent.TrackUnsubscribed, onTrackUnsubscribed);
  };
}
