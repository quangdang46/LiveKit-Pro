"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { scriptApi } from "@/api";
import {
  ScriptResponse,
  ScriptsListResponse,
  UpdateScriptRequest,
  CreateScriptRequest,
} from "@/types/node";

type ScriptContextType = {
  // State
  scripts: ScriptResponse[];
  loading: boolean;
  error: string | null;

  // Actions
  addScript: (newScript: CreateScriptRequest) => Promise<void>;
  deleteScript: (id: string) => Promise<void>;
  updateScript: (
    id: string,
    updatedScript: UpdateScriptRequest
  ) => Promise<void>;
  refreshScripts: () => Promise<void>;
  clearError: () => void;
  testCall: (id: string) => Promise<void>;
};

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

type ScriptProviderProps = {
  children: ReactNode;
};

export function ScriptProvider({ children }: ScriptProviderProps) {
  const [scripts, setScripts] = useState<ScriptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await scriptApi.getAll();
      setScripts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch scripts");
    } finally {
      setLoading(false);
    }
  };

  const addScript = async (newScript: CreateScriptRequest) => {
    try {
      setError(null);
      const { valid } = await scriptApi.validate(newScript.scriptData || []);
      if (!valid) {
        throw new Error("Invalid script data");
      }
      const createdScript = await scriptApi.create(newScript);
      setScripts((prev) => [...prev, createdScript]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create script");
      throw err;
    }
  };

  const deleteScript = async (id: string) => {
    try {
      setError(null);
      await scriptApi.delete(id);
      setScripts((prev) => prev.filter((script) => script.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete script");
      throw err;
    }
  };

  const updateScript = async (
    id: string,
    updatedScript: UpdateScriptRequest
  ) => {
    try {
      setError(null);
      const { valid } = await scriptApi.validate(
        updatedScript.scriptData || []
      );
      if (!valid) {
        throw new Error("Invalid script data");
      }

      const updated = await scriptApi.update(id, updatedScript);
      setScripts((prev) =>
        prev.map((script) => (script.id === id ? updated : script))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update script");
      throw err;
    }
  };

  const refreshScripts = async () => {
    await fetchScripts();
  };

  const clearError = () => {
    setError(null);
  };

  const testCall = async (id: string) => {
    try {
      setError(null);
      await scriptApi.testCall(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to test call");
      throw err;
    }
  };

  useEffect(() => {
    fetchScripts();
  }, []);

  const value: ScriptContextType = {
    scripts,
    loading,
    error,
    addScript,
    deleteScript,
    updateScript,
    refreshScripts,
    clearError,
    testCall,
  };

  return (
    <ScriptContext.Provider value={value}>{children}</ScriptContext.Provider>
  );
}

export function useScripts() {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error("useScripts must be used within a ScriptProvider");
  }
  return context;
}
