"use client";

import "@livekit/components-styles";
import { useEffect, useState, useContext } from "react";
import { useSearchParams } from "next/navigation";
import { useScripts } from "@/contexts/ScriptContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CallingPage() {
  const searchParams = useSearchParams();
  const scriptId = searchParams.get("scriptId");
  const { startTestCall } = useScripts();
  useEffect(() => {
    if (scriptId) {
      startTestCall(scriptId);
    }
  }, [scriptId]);

  const handleButtonClick = (number: number) => {
    const msg = `Button ${number} clicked at ${new Date().toLocaleTimeString()}`;
  };

  return (
    <>
      <Link href="/">
        <h1 className="text-2xl font-bold mb-4 text-center">{scriptId}</h1>
      </Link>
      <div className="flex h-screen">
        <div className="w-1/2 p-4 bg-gray-100">
          <div className="grid grid-cols-3 gap-4 w-fit">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <Button
                variant="outline"
                key={number}
                onClick={() => handleButtonClick(number)}
                className="w-16 h-16  bg-gray-600 text-white font-bold rounded transition-colors"
              >
                {number}
              </Button>
            ))}
          </div>
        </div>

        <div className="w-1/2 p-4 bg-white border-l border-gray-200">
          <div className="h-full text-black p-4 rounded font-mono text-sm overflow-y-auto">
            {scriptId}
          </div>
        </div>
      </div>
    </>
  );
}
