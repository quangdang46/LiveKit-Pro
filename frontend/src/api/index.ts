import {
  EditNodeFormData,
  Node,
  Script,
  ScriptResponse,
  ScriptsListResponse,
  CreateScriptRequest,
  UpdateScriptRequest,
} from "@/types/node";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_ENDPOINT || "http://localhost:3001";

export async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(url, defaultOptions);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export const scriptApi = {
  // Create a new script
  create: async (newScript: CreateScriptRequest): Promise<ScriptResponse> =>
    fetchApi("/script", {
      method: "POST",
      body: JSON.stringify(newScript),
    }) as Promise<ScriptResponse>,

  // Get a single script by ID
  get: async (id: string): Promise<ScriptResponse> =>
    fetchApi(`/script/${id}`) as Promise<ScriptResponse>,

  // Get all scripts
  getAll: async (): Promise<ScriptsListResponse> =>
    fetchApi("/script") as Promise<ScriptsListResponse>,

  // Update an existing script
  update: async (
    id: string,
    updatedScript: UpdateScriptRequest
  ): Promise<ScriptResponse> =>
    fetchApi(`/script/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updatedScript),
    }) as Promise<ScriptResponse>,

  // Delete a script
  delete: async (id: string): Promise<ScriptResponse> =>
    fetchApi(`/script/${id}`, {
      method: "DELETE",
    }) as Promise<ScriptResponse>,

  // Validate script data
  validate: async (scriptData: Node[]): Promise<{ valid: boolean }> => {
    const response = (await fetchApi("/script/validate", {
      method: "POST",
      body: JSON.stringify(scriptData),
    })) as Promise<{ valid: boolean }>;
    return response;
  },
};
