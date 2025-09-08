"use client";

import React, { useState } from "react";
import { ScriptResponse, UpdateScriptRequest } from "@/types/node";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ScriptEditor from "./ScriptEditor";
import ScriptActions from "./ScriptActions";

type ScriptDialogProps = {
  script: ScriptResponse;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (id: string, updatedScript: UpdateScriptRequest) => void;
};

export default function ScriptDialog({
  script,
  isOpen,
  onOpenChange,
  onUpdate,
}: ScriptDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedScript, setEditedScript] = useState(script);
  const [isSaving, setIsSaving] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedScript(script);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: UpdateScriptRequest = {
        name: editedScript.name,
        description: editedScript.description,
        scriptData: editedScript.scriptData,
      };
      await onUpdate?.(script.id, updateData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update script:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedScript({ ...editedScript, name: e.target.value });
  };

  const handleDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditedScript({
      ...editedScript,
      description: e.target.value,
    });
  };

  const handleScriptDataChange = (value: any) => {
    setEditedScript({
      ...editedScript,
      scriptData: value,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogTitle>Script Details</DialogTitle>
        <DialogHeader>
          <div className="flex items-center justify-between">
            {isEditing ? (
              <input
                type="text"
                value={editedScript.name}
                onChange={handleNameChange}
                className="text-xl font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 flex-1 mr-4"
              />
            ) : (
              <div className="text-xl">{script.name}</div>
            )}
          </div>
          <div className="text-sm text-gray-500">ID: {script.id}</div>
          {isEditing ? (
            <textarea
              value={editedScript.description}
              onChange={handleDescriptionChange}
              className="text-sm text-gray-600 mt-2 w-full bg-transparent border border-gray-300 rounded p-2 focus:outline-none focus:border-blue-500 resize-none"
              rows={2}
            />
          ) : (
            <div className="text-sm text-gray-600 mt-2">
              {script.description}
            </div>
          )}
        </DialogHeader>
        <div className="flex-1 min-h-0 mt-4 flex flex-col gap-4">
          <ScriptEditor
            value={editedScript.scriptData}
            onChange={isEditing ? handleScriptDataChange : undefined}
            readOnly={!isEditing}
            height="250px"
          />
          <ScriptActions
            isEditing={isEditing}
            isSaving={isSaving}
            onEdit={handleEdit}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
