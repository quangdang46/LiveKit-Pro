import { useState, useCallback, useEffect } from "react";
import { Room } from "livekit-client";
import { livekitApi } from "@/api";

type UseLiveKitReturn = {
  room: Room | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: (roomName: string, userName: string) => Promise<void>;
  disconnect: () => void;
};

export function useLiveKit(): UseLiveKitReturn {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async (roomName: string, userName: string) => {
    try {
      setIsConnecting(true);
      setError(null);

      const roomInstance = new Room({
        adaptiveStream: true,
        dynacast: true,
      });

      const resp = await livekitApi.getToken(roomName, userName);

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
  }, []);

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

  return {
    room,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  };
}
