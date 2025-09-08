"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

export function useScriptSocket(scriptId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!scriptId) return;

    const s = io(
      process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3000",
      {
        query: { scriptId },
        transports: ["websocket"],
      }
    );

    setSocket(s);

    s.on("connect", () =>
      console.log(` Connected to script ${scriptId}, id:`, s.id)
    );
    s.on("disconnect", () =>
      console.log(` Disconnected from script ${scriptId}`)
    );
    s.on("call_logs", (log: string) => {
      setLogs((prev) => [...prev, log]);
    });

    return () => {
      s.disconnect();
      setLogs([]);
    };
  }, [scriptId]);

  const emit = (event: string, payload: any) => {
    if (socket) {
      socket.emit(event, payload);
    }
  };

  return { socket, logs, emit };
}
