"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/context/AuthContext"
import { loginSchema, type LoginSchema } from "@/lib/auth-schema"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function openExamWindow() {
  if (typeof window === "undefined") return false
  const examUrl = `${window.location.origin}/practice/quiz`
  const features = "toolbar=no,status=no,menubar=no,location=no,resizable=yes,width=1366,height=900"
  const opened = window.open(examUrl, "_blank", features)
  if (!opened) return false
  opened.focus()
  try {
    window.location.replace("about:blank")
    window.close()
  } catch {
    window.location.replace("about:blank")
  }
  return true
}

export function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [authError, setAuthError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  })
  const rememberMeValue = useWatch({
    control: form.control,
    name: "rememberMe",
  })

  const onSubmit = async (values: LoginSchema) => {
    setAuthError("")
    setIsLoading(true)

    try {
      const authResult = await login(values.email, values.password, values.rememberMe)
      if (authResult.role === "student") {
        const opened = openExamWindow()
        if (opened) return
      }
      router.push(authResult.redirectTo)
    } catch {
      setAuthError("Unable to sign in. Please verify credentials and retry.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-sm" htmlFor="remember-me">
            <Checkbox
              id="remember-me"
              checked={Boolean(rememberMeValue)}
              onCheckedChange={(checked) =>
                form.setValue("rememberMe", checked === true)
              }
            />
            Remember me
          </Label>
          <Link
            href="/forgot-password"
            className="text-sm text-teal-700 underline-offset-4 hover:underline dark:text-teal-300"
          >
            Forgot password?
          </Link>
        </div>

        {authError ? <p className="text-sm text-destructive">{authError}</p> : null}

        <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-1 size-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        New to MathTriumph?{" "}
        <Link href="/signup" className="text-teal-700 underline-offset-4 hover:underline dark:text-teal-300">
          Create account
        </Link>
      </p>
    </div>
  )
}
