"use client";

import React from "react";
import ScriptComponent from "./ScriptComponent";
import { useScripts } from "@/contexts/ScriptContext";

export default function ScriptGrid() {
  const { scripts, updateScript } = useScripts();
  if (scripts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400 mb-2">
          No scripts available
        </div>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Click "Add Script" to create your first script
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
      {scripts.map((script) => (
        <ScriptComponent
          key={script.id}
          script={script}
          onUpdate={updateScript}
        />
      ))}
    </div>
  );
}
