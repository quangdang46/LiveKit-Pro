"use client";

import { useState, useEffect } from "react";
import { scriptApi } from "@/api";
import { Script, ScriptResponse } from "@/types/node";
import AddScriptModal from "@/components/AddScriptModal";
import ScriptGrid from "@/components/ScriptGrid";

export default function Home() {
  const [scripts, setScripts] = useState<ScriptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScripts = async () => {
      try {
        setLoading(true);
        const data = await scriptApi.getAll();
        setScripts(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch scripts"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScripts();
  }, []);

  const handleAddScript = async (newScript: Script) => {
    try {
      const createdScript = await scriptApi.create(newScript);
      setScripts((prev) => [...prev, createdScript]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create script");
    }
  };

  const handleDeleteScript = async (id: string) => {
    try {
      await scriptApi.delete(id);
      setScripts((prev) => prev.filter((script) => script.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete script");
    }
  };

  const handleUpdateScript = async (
    id: string,
    updatedScript: Partial<ScriptResponse>
  ) => {
    try {
      const editData = {
        type: "SpeechNode" as const,
        data: {},
        jsonData: JSON.stringify(updatedScript.scriptData || []),
      };

      const updated = await scriptApi.update(id, editData);
      setScripts((prev) =>
        prev.map((script) => (script.id === id ? updated : script))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update script");
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading scripts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Script Management</h1>
        </div>
        <AddScriptModal onAddScript={handleAddScript} />
      </div>

      <ScriptGrid
        scripts={scripts}
        onDelete={handleDeleteScript}
        onUpdate={handleUpdateScript}
        className="mb-8"
      />
    </div>
  );
}
