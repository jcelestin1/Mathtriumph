import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"

type ChartWrapperProps = {
  title: string
  description?: string
  className?: string
  contentClassName?: string
  children: React.ReactNode
}

export function ChartWrapper({
  title,
  description,
  className,
  contentClassName,
  children,
}: ChartWrapperProps) {
  return (
    <Card
      className={cn(
        "premium-surface overflow-hidden border-teal-400/20 bg-gradient-to-b from-background via-background to-teal-50/20 shadow-sm dark:border-teal-500/25 dark:to-teal-500/5",
        className
      )}
    >
      <CardHeader>
        <CardTitle className="inline-flex items-center gap-2 text-base text-foreground">
          <Sparkles className="size-4 text-teal-500" />
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={cn("pt-0", contentClassName)}>{children}</CardContent>
    </Card>
  )
}

export const EnhancedChartWrapper = ChartWrapper
