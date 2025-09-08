import { EditNodeFormData, Node, Script, ScriptResponse } from "@/types/node";

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
  create: async (newScript: Script): Promise<ScriptResponse> =>
    fetchApi("/script", {
      method: "POST",
      body: JSON.stringify(newScript),
    }) as Promise<ScriptResponse>,

  get: async (id: string): Promise<ScriptResponse> =>
    fetchApi(`/script/${id}`) as Promise<ScriptResponse>,
  getAll: async () => fetchApi("/script"),
  update: async (
    id: string,
    newScript: EditNodeFormData
  ): Promise<ScriptResponse> =>
    fetchApi(`/script/${id}`, {
      method: "PATCH",
      body: JSON.stringify(newScript),
    }) as Promise<ScriptResponse>,

  delete: async (id: string): Promise<ScriptResponse> =>
    fetchApi(`/script/${id}`, {
      method: "DELETE",
    }) as Promise<ScriptResponse>,

  validate: async (scriptData: Node[]): Promise<{ valid: boolean }> => {
    const response = (await fetchApi("/script/validate", {
      method: "POST",
      body: JSON.stringify(scriptData),
    })) as Promise<{ valid: boolean }>;
    return response;
  },
};
