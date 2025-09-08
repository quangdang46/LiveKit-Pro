"use client";

import { useScripts } from "@/contexts/ScriptContext";
import AddScriptModal from "@/components/AddScriptModal";
import ScriptGrid from "@/components/ScriptGrid";

export default function Home() {
  const { scripts, loading, error, addScript, deleteScript, updateScript } =
    useScripts();

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
        <AddScriptModal />
      </div>

      <ScriptGrid />
    </div>
  );
}
