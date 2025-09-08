import { useState, useCallback, useEffect } from "react";
import { Participant, Room, RoomEvent } from "livekit-client";
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
  log: string;
};

export function useLiveKit(): UseLiveKitReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<string>("");

  const connect = useCallback(
    async (roomName: string, userName: string, scriptId: string) => {
      try {
        setIsConnecting(true);
        setError(null);

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
      const msg = { type: "dtmf", digit };

      try {
        room.localParticipant.publishData(
          new TextEncoder().encode(JSON.stringify(msg)),
          { reliable: true }
        );
        console.log("Sent DTMF", msg);
      } catch (err) {
        console.error("Failed to send DTMF", err);
      }
    },
    [room]
  );

  useEffect(() => {
    if (!room) return;

    room.on(RoomEvent.DataReceived, (payload, participant) => {
      const msg = JSON.parse(new TextDecoder().decode(payload));
      setLog(
        (prev) =>
          prev +
          `Client received ${JSON.stringify(msg)} from ${
            participant?.identity
          }\n`
      );
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
  };
}
