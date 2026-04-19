import { Skeleton } from "@/components/ui/skeleton"

export default function ParentDashboardLoading() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-7 w-64" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-44 w-full" />
        <Skeleton className="h-44 w-full" />
      </div>
      <Skeleton className="h-72 w-full" />
    </section>
  )
}
