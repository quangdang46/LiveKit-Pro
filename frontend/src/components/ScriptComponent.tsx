"use client";

import React, { useState } from "react";
import { EllipsisVertical, Trash2, Phone } from "lucide-react";
import Editor from "@monaco-editor/react";
import { ScriptResponse } from "@/types/node";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface ScriptComponentProps {
  script: ScriptResponse;
  onDelete?: (id: string) => void;
  onTestCall?: (id: string) => void;
  onUpdate?: (id: string, updatedScript: Partial<ScriptResponse>) => void;
  className?: string;
}

export default function ScriptComponent({
  script,
  onDelete,
  onTestCall,
  onUpdate,
  className,
}: ScriptComponentProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(script);
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div
          className={cn(
            "relative p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors",
            className
          )}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0 mr-3">
              <div className="text-sm text-gray-500  mb-1">ID: {script.id}</div>
              <h3 className="text-lg font-semibold text-gray-900  mb-2">
                {script.name}
              </h3>
              <p className="text-sm text-gray-600  line-clamp-2">
                {script.description}
              </p>
            </div>

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  className="p-1 hover:bg-gray-200 rounded-sm transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPopoverOpen(!isPopoverOpen);
                  }}
                >
                  <EllipsisVertical className="w-4 h-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2" align="end">
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPopoverOpen(false);
                    onDelete?.(script.id);
                  }}
                  className="flex items-center gap-2 w-full px-2 py-1 text-sm   rounded-sm "
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 ">
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTestCall?.(script.id);
              }}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <Phone className="w-3 h-3" />
              Test Call
            </Button>
          </div>
        </div>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogTitle>Script Details</DialogTitle>
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <input
                type="text"
                value={editedScript.name}
                onChange={(e) =>
                  setEditedScript({ ...editedScript, name: e.target.value })
                }
                className="text-xl font-semibold bg-transparent border-b border-gray-300  focus:outline-none focus:border-blue-500 flex-1 mr-4"
              />
            ) : (
              <div className="text-xl">{script.name}</div>
            )}
          </div>
          <div className="text-sm text-gray-500 ">ID: {script.id}</div>
          {isEditing ? (
            <textarea
              value={editedScript.description}
              onChange={(e) =>
                setEditedScript({
                  ...editedScript,
                  description: e.target.value,
                })
              }
              className="text-sm text-gray-600  mt-2 w-full bg-transparent border border-gray-300  rounded p-2 focus:outline-none focus:border-blue-500 resize-none"
              rows={2}
            />
          ) : (
            <div className="text-sm text-gray-600  mt-2">
              {script.description}
            </div>
          )}
        </DialogHeader>
        <div className="flex-1 min-h-0 mt-4 flex flex-col gap-4">
          <div className="h-[250px] border rounded-md overflow-hidden">
            <Editor
              height="250px"
              language="json"
              value={JSON.stringify(editedScript.scriptData, null, 2)}
              onChange={
                isEditing
                  ? (value) =>
                      setEditedScript({
                        ...editedScript,
                        scriptData: JSON.parse(value || "[]"),
                      })
                  : undefined
              }
              options={{
                readOnly: !isEditing,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                theme: "vs-light",
              }}
            />
          </div>
          <div className="flex gap-2 self-end">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} size="sm">
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedScript(script); // Reset to original values
                  }}
                  variant="outline"
                  size="sm"
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  onClick={async () => {
                    setIsSaving(true);
                    try {
                      await onUpdate?.(script.id, editedScript);
                      setIsEditing(false);
                    } catch (error) {
                      console.error("Failed to update script:", error);
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  size="sm"
                  disabled={isSaving}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
