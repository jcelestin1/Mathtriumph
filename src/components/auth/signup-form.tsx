"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2, Sparkles } from "lucide-react"
import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { useAuth } from "@/context/AuthContext"
import { signupSchema, type SignupSchema } from "@/lib/auth-schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const roles: SignupSchema["role"][] = ["student", "teacher", "parent"]

export function SignupForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
    },
  })
  const roleValue = useWatch({
    control: form.control,
    name: "role",
  })

  const onSubmit = async (values: SignupSchema) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      })
      const json = (await response.json()) as { message?: string }
      if (!response.ok) {
        throw new Error(json.message ?? "Unable to create account.")
      }
      await login(values.email, values.password, true)
      router.push("/dashboard")
    } catch (error) {
      form.setError("root", {
        message: error instanceof Error ? error.message : "Unable to create account.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="full-name">Full Name</Label>
        <Input id="full-name" placeholder="Alex Carter" {...form.register("fullName")} />
        {form.formState.errors.fullName ? (
          <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input id="signup-email" type="email" placeholder="you@example.com" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label>Role</Label>
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => {
            const active = roleValue === role
            return (
              <button
                key={role}
                type="button"
                onClick={() => form.setValue("role", role)}
                className={`rounded-md border px-3 py-1.5 text-sm capitalize transition ${
                  active
                    ? "border-teal-500 bg-teal-50 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200"
                    : "border-border"
                }`}
              >
                {role}
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input id="signup-password" type="password" placeholder="Create password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-xs text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input id="confirm-password" type="password" placeholder="Confirm password" {...form.register("confirmPassword")} />
        {form.formState.errors.confirmPassword ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Badge variant="secondary" className="text-xs">
        <Sparkles className="mr-1 size-3.5" />
        Secure account setup for your Triumph journey
      </Badge>

      <Button type="submit" className="w-full bg-teal-600 text-white hover:bg-teal-700" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-1 size-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Create account"
        )}
      </Button>

      {form.formState.errors.root?.message ? (
        <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
      ) : null}

      <p className="text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-teal-700 underline-offset-4 hover:underline dark:text-teal-300">
          Log in
        </Link>
      </p>
    </form>
  )
}
