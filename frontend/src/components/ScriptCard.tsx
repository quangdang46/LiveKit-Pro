"use client";

import React, { useState } from "react";
import { EllipsisVertical, Trash2, Phone } from "lucide-react";
import { ScriptResponse } from "@/types/node";
import { useScripts } from "@/contexts/ScriptContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import TestCall from "./TestCall";

type ScriptCardProps = {
  script: ScriptResponse;
};

export default function ScriptCard({ script }: ScriptCardProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const { deleteScript } = useScripts();

  return (
    <div className="relative p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 mr-3">
          <div className="text-sm text-gray-500 mb-1">ID: {script.id}</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {script.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {script.description}
          </p>
        </div>

        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPopoverOpen(!isPopoverOpen);
              }}
            >
              <EllipsisVertical className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-40 p-2" align="end">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsPopoverOpen(false);
                deleteScript(script.id);
              }}
              className="flex items-center gap-2 w-full px-2 py-1 text-sm rounded-sm"
              variant="ghost"
            >
              <Trash2 className="w-3 h-3" />
              Delete
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <TestCall id={script.id} />
    </div>
  );
}
