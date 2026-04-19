"use client"

import { FormEvent, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SubmissionState = "idle" | "success" | "error"

export function WaitlistForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle")
  const [message, setMessage] = useState("")

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmissionState("idle")
    setMessage("")

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
        }),
      })

      const data = (await response.json()) as { message?: string }

      if (!response.ok) {
        throw new Error(data.message ?? "Unable to submit waitlist request.")
      }

      setSubmissionState("success")
      setMessage(data.message ?? "You're on the list.")
      setFullName("")
      setEmail("")
    } catch (error) {
      setSubmissionState("error")
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <form className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]" onSubmit={onSubmit}>
        <Input
          type="text"
          placeholder="Full name (optional)"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          maxLength={80}
          aria-label="Full name"
        />
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          aria-label="Email address"
        />
        <Button type="submit" disabled={isSubmitting} className="sm:min-w-36">
          {isSubmitting ? "Joining..." : "Join Waitlist"}
        </Button>
      </form>

      {submissionState === "success" ? (
        <Alert>
          <AlertTitle>Request received</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}

      {submissionState === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Submission failed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}
