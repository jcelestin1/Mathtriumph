"use client"

import { AlertTriangle, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { detectDisplayRisk } from "@/lib/proctoring"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Props = {
  quizId: string
}

export function SecureStartQuizButton({ quizId }: Props) {
  const router = useRouter()
  const [isBlocked, setIsBlocked] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [warningReasons, setWarningReasons] = useState<string[]>([])

  function onStartClick() {
    if (typeof window === "undefined") return
    const risk = detectDisplayRisk(window)
    if (risk.multiMonitorDetected) {
      setIsBlocked(true)
      setWarningReasons(
        risk.reasons.length
          ? risk.reasons
          : ["Multiple monitor layout detected. Disconnect extra displays to continue."]
      )
      setIsModalOpen(true)
      return
    }
    if (risk.secondaryDisplayRisk) {
      setWarningReasons(
        risk.reasons.length
          ? risk.reasons
          : ["Potential secondary display setup detected."]
      )
      setIsModalOpen(true)
    }
    router.push(`/practice/quiz/${quizId}`)
  }

  return (
    <>
      <Button
        type="button"
        onClick={onStartClick}
        disabled={isBlocked}
        className="w-full bg-teal-600 text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-muted"
      >
        {isBlocked ? (
          <>
            <AlertTriangle className="mr-1 size-4" />
            Start Blocked: Multiple monitors detected
          </>
        ) : (
          <>
            <ShieldCheck className="mr-1 size-4" />
            Start Quiz
          </>
        )}
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>You aren&apos;t slick.</DialogTitle>
            <DialogDescription>
              Secondary display signals were detected. Disconnect external displays and retry.
            </DialogDescription>
          </DialogHeader>
          <ul className="ml-4 list-disc space-y-1 text-xs text-muted-foreground">
            {warningReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button type="button" onClick={() => setIsModalOpen(false)}>
              Acknowledge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
