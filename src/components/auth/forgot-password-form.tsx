"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from "@/lib/auth-schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async () => {
    setIsLoading(true)
    setSuccessMessage("")
    try {
      const values = form.getValues()
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: values.email }),
      })
      const json = (await response.json()) as { message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to send reset link.")
      }
      setSuccessMessage(json.message ?? "If this email exists, a reset link has been sent.")
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Unable to send reset link.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="recovery-email">Email</Label>
        <Input id="recovery-email" type="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      {successMessage ? (
        <p className="rounded-md border border-emerald-500/40 bg-emerald-500/10 p-2 text-sm text-emerald-700 dark:text-emerald-300">
          {successMessage}
        </p>
      ) : null}
      {form.formState.errors.root?.message ? (
        <p className="text-xs text-destructive">{form.formState.errors.root.message}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-1 size-4 animate-spin" />
            Sending reset link...
          </>
        ) : (
          "Send reset link"
        )}
      </Button>

      <p className="text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href="/login" className="text-teal-700 underline-offset-4 hover:underline dark:text-teal-300">
          Back to login
        </Link>
      </p>
    </form>
  )
}
