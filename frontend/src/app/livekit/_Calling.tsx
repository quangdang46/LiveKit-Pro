"use client";

import "@livekit/components-styles";
import { useEffect, useState, useContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useScripts } from "@/contexts/ScriptContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallingPage() {
  const searchParams = useSearchParams();
  const scriptId = searchParams.get("scriptId");
  const router = useRouter();
  const { startTestCall, handleButtonClick, testCallLog, endTestCall } =
    useScripts();
  useEffect(() => {
    if (scriptId) {
      startTestCall(scriptId);
    }
  }, [scriptId]);

  const onClick = (b: string) => {
    handleButtonClick(b);
  };

  const onEndCall = () => {
    endTestCall();
    router.push("/");
  };

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
            {testCallLog.map((log, index) => (
              <div className="mb-2 text-xs" key={index}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
