import { Skeleton } from "@/components/ui/skeleton"

export default function PracticeQuizLoading() {
  return (
    <section className="mx-auto w-full max-w-4xl space-y-4">
      <Skeleton className="h-36 w-full rounded-xl" />
      <Skeleton className="h-[420px] w-full rounded-xl" />
    </section>
  )
}
