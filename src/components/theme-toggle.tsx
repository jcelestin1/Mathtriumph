"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"

const THEME_STORAGE_KEY = "mathtriumph-theme"

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") {
      return false
    }
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme) {
      const useDarkMode = storedTheme === "dark"
      document.documentElement.classList.toggle("dark", useDarkMode)
      return useDarkMode
    }
    const useDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
    document.documentElement.classList.toggle("dark", useDarkMode)
    return useDarkMode
  })

  const onToggleTheme = () => {
    const nextThemeIsDark = !isDark
    document.documentElement.classList.toggle("dark", nextThemeIsDark)
    window.localStorage.setItem(
      THEME_STORAGE_KEY,
      nextThemeIsDark ? "dark" : "light"
    )
    setIsDark(nextThemeIsDark)
  }

  return (
    <Button variant="outline" size="sm" onClick={onToggleTheme}>
      {isDark ? "Light mode" : "Dark mode"}
    </Button>
  )
}
