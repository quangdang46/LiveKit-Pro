"use client";

import React, { useState } from "react";
import { ScriptResponse, UpdateScriptRequest } from "@/types/node";
import ScriptCard from "./ScriptCard";
import ScriptDialog from "./ScriptDialog";

interface ScriptComponentProps {
  script: ScriptResponse;
  onDelete?: (id: string) => void;
  onTestCall?: (id: string) => void;
  onUpdate?: (id: string, updatedScript: UpdateScriptRequest) => void;
  className?: string;
}

export default function ScriptComponent({
  script,
  onDelete,
  onTestCall,
  onUpdate,
  className,
}: ScriptComponentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsDialogOpen(true)}>
        <ScriptCard
          script={script}
          onDelete={onDelete}
          onTestCall={onTestCall}
          className={className}
        />
      </div>

      <ScriptDialog
        script={script}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}
