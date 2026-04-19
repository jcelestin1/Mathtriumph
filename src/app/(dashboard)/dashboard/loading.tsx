export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-56 animate-pulse rounded-xl bg-muted" />
      </div>
    </main>
  )
}
