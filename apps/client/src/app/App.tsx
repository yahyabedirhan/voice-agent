import { useQuery } from "@tanstack/react-query"

import { getBackendHealth } from "@/lib/backend"

export function App() {
  const health = useQuery({
    queryKey: ["backend-health"],
    queryFn: getBackendHealth,
  })

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <section className="w-full rounded-xl border bg-card p-8 text-card-foreground shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">
          Voice Agent Platform
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Platform foundation
        </h1>
        <p className="mt-3 text-muted-foreground">
          Client-side and Backend are running. Agent experiences will be added
          separately.
        </p>
        <p className="mt-6 text-sm" role="status">
          {health.isPending && "Checking Backend…"}
          {health.isSuccess && "Backend connected"}
          {health.isError && "Backend unavailable"}
        </p>
      </section>
    </main>
  )
}
