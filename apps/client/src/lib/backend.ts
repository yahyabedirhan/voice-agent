export type BackendHealth = {
  status: "ok"
  service: "backend"
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8787"

export async function getBackendHealth(): Promise<BackendHealth> {
  const response = await fetch(`${apiBaseUrl}/health`)

  if (!response.ok) {
    throw new Error(`Backend health request failed with ${response.status}`)
  }

  return response.json() as Promise<BackendHealth>
}
