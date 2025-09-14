import { useState, useCallback, useEffect, useRef } from "react";
import {
  Participant,
  RemoteAudioTrack,
  RemoteParticipant,
  RemoteTrack,
  RemoteTrackPublication,
  Room,
  RoomEvent,
  TrackPublication,
} from "livekit-client";
import { livekitApi } from "@/api";

type UseLiveKitReturn = {
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (
    roomName: string,
    userName: string,
    scriptId: string
  ) => Promise<void>;
  disconnect: () => void;
  sendDtmf: (digit: string) => Promise<void>;
  log: string[];
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
};

export function useLiveKit(): UseLiveKitReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const connect = useCallback(
    async (roomName: string, userName: string, scriptId: string) => {
      try {
        setIsConnecting(true);
        setError(null);
        setLog([]);

        const roomInstance = new Room({
          adaptiveStream: true,
          dynacast: true,
        });

        const resp = await livekitApi.getToken(roomName, userName, scriptId);

        if (resp.token) {
          await roomInstance.connect(
            process.env.NEXT_PUBLIC_LIVEKIT_URL!,
            resp.token
          );
          setRoom(roomInstance);
          setIsConnected(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to connect");
        console.error(err);
      } finally {
        setIsConnecting(false);
      }
    },
    []
  );

  const disconnect = useCallback(() => {
    if (room) {
      room.disconnect();
      setRoom(null);
      setIsConnected(false);
    }
  }, [room]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const sendDtmf = useCallback(
    async (digit: string) => {
      if (!room) return;
      const msg = {
        type: "dtmf",
        digit,
        roomName: room.name,
        participantId: room.localParticipant.identity,
      };

      try {
        room.localParticipant.publishData(
          new TextEncoder().encode(JSON.stringify(msg)),
          { reliable: true }
        );
      } catch (err) {
        console.error("Failed to send DTMF", err);
      }
    },
    [room]
  );

  const playBeepFile = useCallback(async () => {
    console.log("Playing beep file");
    try {
      setIsPlaying(true);
      const audio = new Audio("/beep.mp3");
      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.onerror = () => {
        setIsPlaying(false);
      };

      await audio.play();
    } catch (error) {
      setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    if (!room) return;
    // room.localParticipant.setScreenShareEnabled(true);
    room.localParticipant.enableCameraAndMicrophone();
  }, [room]);

  useEffect(() => {
    if (!room) return;

    room.on(RoomEvent.DataReceived, (payload, participant) => {
      const decoder = new TextDecoder();
      const payloadString = decoder.decode(payload);

      try {
        const msg = JSON.parse(payloadString) as {
          message?: string;
          type?: string;
          playBeep?: boolean;
        };

        if (msg.type === "recording" && msg.playBeep) {
          setLog((prev) => [...prev, "Playing beep file"]);
          playBeepFile();
        }

        const timestamp = new Date().toLocaleString();
        const logMessage = msg.message || `${msg.type} event`;

        setLog((prev) => [...prev, `[${timestamp}]\n` + `${logMessage}\n\n`]);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    });

    room.on(RoomEvent.ParticipantDisconnected, (participant) => {
      console.log("Participant disconnected", participant);
    });

    room.on(RoomEvent.Disconnected, () => {
      console.log("Agent: Call ended room disconnected");
    });

    room.on(
      RoomEvent.TrackSubscribed,
      (
        track: RemoteTrack,
        pub: RemoteTrackPublication,
        participant: RemoteParticipant
      ) => {
        if (track.kind === "audio" && participant.identity.includes("agent")) {
          console.log("Subscribed to agent audio:", {
            participant: participant.identity,
            trackSid: pub.trackSid,
          });
          (track as RemoteAudioTrack).attach(audioRef.current!);
        }
      }
    );

    room.on(RoomEvent.TrackUnsubscribed, (track, pub, participant) => {
      if (track.kind === "audio" && participant.identity.includes("agent")) {
        console.log("Unsubscribed from agent audio:", {
          participant: participant.identity,
          trackSid: pub.trackSid,
        });
        (track as RemoteAudioTrack).detach(audioRef.current!);
      }
    });
  }, [room]);

  return {
    room,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendDtmf,
    log,
    isPlaying,
    audioRef,
  };
}
