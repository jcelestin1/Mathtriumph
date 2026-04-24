"use client"

/**
 * StartQuizButton
 *
 * Client component that:
 *  1. Performs a hardware-detection check BEFORE allowing the student to start.
 *  2. Blocks start if multiple monitors / TV / HDMI setup is detected.
 *  3. On success, signals to the parent (via onStart callback) that the exam
 *     is ready to begin, so ExamMonitorShell can activate.
 *
 * Usage (from a Server Component):
 *   <StartQuizButton href={`/practice/quiz/${quiz.id}`} />
 *
 * Or from a Client Component:
 *   <StartQuizButton onStart={() => setExamActive(true)} />
 */

import Link from "next/link"
import { useCallback, useState } from "react"
import { MonitorOff, PlayCircle, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"

type HwBlock = {
  reason: "secondary_display" | "tv_hdmi"
  detail: string
}

function checkHardwareBlock(): HwBlock | null {
  if (typeof window === "undefined") return null
  const { screen, devicePixelRatio } = window

  if (screen.width >= 3840 || devicePixelRatio < 0.9) {
    return {
      reason: "tv_hdmi",
      detail: `Screen width ${screen.width}px / DPR ${devicePixelRatio.toFixed(2)} indicates a TV or HDMI output.`,
    }
  }
  if (screen.width > 2560 || devicePixelRatio < 1) {
    return {
      reason: "secondary_display",
      detail: `Screen width ${screen.width}px / DPR ${devicePixelRatio.toFixed(2)} indicates a secondary or wide-gamut display.`,
    }
  }
  return null
}

type StartQuizButtonProps = {
  /** Navigate to this URL on successful start (server-component-friendly). */
  href?: string
  /** Called when hardware check passes and exam can begin. */
  onStart?: () => void
  className?: string
}

export function StartQuizButton({ href, onStart, className }: StartQuizButtonProps) {
  const [block, setBlock] = useState<HwBlock | null>(null)
  const [dismissed, setDismissed] = useState(false)

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const hw = checkHardwareBlock()
      if (hw && !dismissed) {
        e.preventDefault()
        setBlock(hw)
        return
      }
      onStart?.()
    },
    [dismissed, onStart]
  )

  return (
    <div className="space-y-2">
      {block && !dismissed ? (
        <div className="rounded-lg border border-amber-300/70 bg-amber-50/70 p-4 text-sm dark:bg-amber-500/10">
          <p className="mb-1 inline-flex items-center gap-2 font-semibold text-amber-800 dark:text-amber-300">
            <MonitorOff className="size-4" aria-hidden />
            You aren&apos;t slick.
          </p>
          <p className="text-muted-foreground">{block.detail}</p>
          <p className="mt-2 text-muted-foreground">
            Unplug secondary displays / HDMI cables before starting the exam.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setBlock(null)
                setDismissed(false)
              }}
            >
              Re-check hardware
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground"
              onClick={() => {
                setDismissed(true)
                setBlock(null)
              }}
            >
              Proceed anyway (logged)
            </Button>
          </div>
        </div>
      ) : null}

      {href ? (
        <Button
          render={<Link href={href} onClick={handleClick} />}
          className={`w-full bg-teal-600 text-white hover:bg-teal-700 ${className ?? ""}`}
        >
          <PlayCircle className="mr-1 size-4" aria-hidden />
          Start Quiz
          <ShieldCheck className="ml-auto size-3.5 opacity-60" aria-hidden />
        </Button>
      ) : (
        <Button
          className={`w-full bg-teal-600 text-white hover:bg-teal-700 ${className ?? ""}`}
          onClick={handleClick}
        >
          <PlayCircle className="mr-1 size-4" aria-hidden />
          Start Quiz
          <ShieldCheck className="ml-auto size-3.5 opacity-60" aria-hidden />
        </Button>
      )}
    </div>
  )
}
