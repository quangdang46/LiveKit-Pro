"use client";

import React from "react";
import { ScriptResponse } from "@/types/node";
import { cn } from "@/lib/utils";
import ScriptComponent from "./ScriptComponent";

interface ScriptGridProps {
  scripts: ScriptResponse[];
  onDelete?: (id: string) => void;
  onTestCall?: (id: string) => void;
  onUpdate?: (id: string, updatedScript: Partial<ScriptResponse>) => void;
  className?: string;
}

export default function ScriptGrid({
  scripts,
  onDelete,
  onTestCall,
  onUpdate,
  className,
}: ScriptGridProps) {
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
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
        className
      )}
    >
      {scripts.map((script) => (
        <ScriptComponent
          key={script.id}
          script={script}
          onDelete={onDelete}
          onTestCall={onTestCall}
          onUpdate={onUpdate}
          className="h-full flex flex-col"
        />
      ))}
    </div>
  );
}
