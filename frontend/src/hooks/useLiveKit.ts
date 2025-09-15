import { useState, useCallback, useEffect, useRef } from "react";
import { Room } from "livekit-client";
import { livekitApi } from "@/api";
import { playAudio, removeAudioElement } from "@/lib/livekit/audio";
import { disconnectFromRoom } from "@/lib/livekit/connection";
import { registerRoomEventHandlers } from "@/lib/livekit/events";

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
    if (!room) return;
    disconnectFromRoom(room, audioRef.current);
    setRoom(null);
    setIsConnected(false);
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
    await playAudio("/beep.mp3", setIsPlaying);
  }, []);

  useEffect(() => {
    if (!room) return;
    room.localParticipant.setScreenShareEnabled(true);
    // room.localParticipant.enableCameraAndMicrophone();
  }, [room]);

  useEffect(() => {
    if (!room) return;

    const unregister = registerRoomEventHandlers(room, {
      audioEl: audioRef.current,
      onLog: (entry: string) => setLog((prev) => [...prev, entry]),
      onPlayBeep: () => void playBeepFile(),
      onDisconnected: () => {
        setIsConnected(false);
        setRoom(null);
        removeAudioElement(audioRef.current);
      },
    });

    return unregister;
  }, [room, playBeepFile]);

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
