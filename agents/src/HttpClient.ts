export class HttpClient {
  constructor(
    private baseUrl: string = process.env.API_URL ?? "http://localhost:3000",
    private headers: Record<string, string> = {}
  ) {}

  async get<T>(endpoint: string): Promise<T> {
    const res = await fetch(this.baseUrl + endpoint, { headers: this.headers });
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    return res.json();
  }
}
