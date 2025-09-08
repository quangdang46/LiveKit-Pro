"use client";

import React, { useState } from "react";
import { ScriptResponse, UpdateScriptRequest } from "@/types/node";
import ScriptCard from "./ScriptCard";
import ScriptDialog from "./ScriptDialog";
import { useScripts } from "@/contexts/ScriptContext";

type ScriptComponentProps = {
  script: ScriptResponse;
  onUpdate?: (id: string, updatedScript: UpdateScriptRequest) => void;
};

export default function ScriptComponent({
  script,
  onUpdate,
}: ScriptComponentProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { updateScript } = useScripts();

  return (
    <>
      <div onClick={() => setIsDialogOpen(true)}>
        <ScriptCard script={script} />
      </div>

      <ScriptDialog
        script={script}
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onUpdate={onUpdate || updateScript}
      />
    </>
  );
}
