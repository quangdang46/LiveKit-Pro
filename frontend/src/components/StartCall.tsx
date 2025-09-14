"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

type StartCallProps = {
  scriptId: string | null;
  isConnecting: boolean;
  error: string | null;
  onStartCall: () => void;
};

export default function StartCall({
  scriptId,
  isConnecting,
  error,
  onStartCall,
}: StartCallProps) {
  return (
    <>
      <Link href="/">
        <h1 className="text-2xl font-bold mb-4 text-center">{scriptId}</h1>
      </Link>
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl mb-4">Ready to start call?</h2>
          <p className="text-gray-600 mb-6">
            Click Start Call to begin and unlock audio playback
          </p>
          <Button
            onClick={onStartCall}
            disabled={isConnecting}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 text-lg disabled:opacity-50"
          >
            {isConnecting ? "Connecting..." : "Start Call"}
          </Button>
          {error && <p className="text-red-600 mt-4">Error: {error}</p>}
        </div>
      </div>
    </>
  );
}
