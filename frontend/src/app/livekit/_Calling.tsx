/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLiveKit } from "@/hooks/useLiveKit";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import StartCall from "@/components/StartCall";

export default function CallingPage() {
  const searchParams = useSearchParams();
  const scriptId = searchParams.get("scriptId");
  const router = useRouter();
  const [isAudioUnlocked, setIsAudioUnlocked] = useState(false);
  const [isCallStarted, setIsCallStarted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const {
    connect,
    disconnect,
    sendDtmf,
    log,
    audioRef,
    isConnected,
    error,
  } = useLiveKit();
  const unlockAudio = async () => {
    try {
      if (window.AudioContext || (window as any).webkitAudioContext) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContext();
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }
      }

      if (audioRef.current) {
        audioRef.current.muted = false;
      }

      setIsAudioUnlocked(true);
    } catch (error) {
      console.error('Failed to unlock audio:', error);
    }
  };

  const startCall = async () => {
    if (!scriptId) return;

    try {
      setIsConnecting(true);
      await unlockAudio();

      const roomName = `test-call-${scriptId}-${Date.now()}`;
      const userName = `test-user-${scriptId}-${Date.now()}`;

      await connect(roomName, userName, scriptId);
      setIsCallStarted(true);
    } catch (error) {
      console.error('Failed to start call:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const onClick = (b: string) => {
    sendDtmf(b);
  };

  const onEndCall = () => {
    disconnect();
    router.push("/");
  };

  useEffect(() => {
    if (isConnected && !isCallStarted) {
      setIsCallStarted(true);
    }
  }, [isConnected, error]);

  if (!isCallStarted) {
    return (
      <>
        <StartCall
          scriptId={scriptId}
          isConnecting={isConnecting}
          error={error}
          onStartCall={startCall}
        />
      </>
    );
  }

  return (
    <>
      <Link href="/">
        <h1 className="text-2xl font-bold mb-4 text-center">{scriptId}</h1>
      </Link>
      <div className="flex h-screen">
        <div className="w-1/3 p-4 bg-gray-100">
          <div className="grid grid-cols-3 gap-4 w-fit">
            {["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "#"].map(
              (number) => (
                <Button
                  variant="outline"
                  key={number}
                  onClick={() => onClick(number)}
                  className="w-16 h-16  bg-gray-600 text-white font-bold rounded transition-colors"
                >
                  {number}
                </Button>
              )
            )}
          </div>
          <Button
            variant="secondary"
            className="bg-red-600 p-4 xl mt-5"
            onClick={onEndCall}
          >
            End Call
          </Button>
        </div>

        <div className="w-2/3 p-4 bg-white border-l border-gray-200">
          <div className="h-full text-black p-4 rounded font-mono text-sm overflow-y-auto">
            {log.map((logEntry, index) => (
              <div className="mb-2 text-xs" key={index}>
                {logEntry}
              </div>
            ))}
          </div>
        </div>
      </div>
      <audio ref={audioRef} autoPlay playsInline muted={!isCallStarted} />
    </>
  );
}
