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
};

export function useLiveKit(): UseLiveKitReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const participant = room.localParticipant;

      const dtmfCodes: Record<string, number> = {
        "0": 0,
        "1": 1,
        "2": 2,
        "3": 3,
        "4": 4,
        "5": 5,
        "6": 6,
        "7": 7,
        "8": 8,
        "9": 9,
        "*": 10,
        "#": 11,
      };

      const code = dtmfCodes[digit];
      if (code === undefined) {
        console.warn("Invalid DTMF digit", digit);
        return;
      }

      try {
        await participant.publishDtmf(code, digit);
        console.log(`Sent DTMF: ${digit} (${code})`);
      } catch (err) {
        console.error("Failed to send DTMF", err);
      }
    },
    [room]
  );

  useEffect(() => {
    console.log("room", room);
    if (!room) return;
    console.log("have room", room);
    const handler = (
      dtmf: { code: number; digit: string },
      participant?: Participant
    ) => {
      console.log(
        "[Client] DTMF received:",
        dtmf.digit,
        `(${dtmf.code}) from ${participant?.identity}`
      );
    };

    room.on(RoomEvent.SipDTMFReceived, handler);

    return () => {
      room.off(RoomEvent.SipDTMFReceived, handler);
    };
  }, [room]);

  return {
    room,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
    sendDtmf,
  };
}
