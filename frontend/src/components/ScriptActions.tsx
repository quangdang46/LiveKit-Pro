"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type ScriptActionsProps = {
  isEditing: boolean;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function ScriptActions({
  isEditing,
  isSaving,
  onEdit,
  onCancel,
  onSave,
}: ScriptActionsProps) {
  return (
    <div className="flex gap-2 self-end">
      {!isEditing ? (
        <Button onClick={onEdit} size="sm">
          Edit
        </Button>
      ) : (
        <>
          <Button
            onClick={onCancel}
            variant="outline"
            size="sm"
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={onSave} size="sm" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </>
      )}
    </div>
  );
}
