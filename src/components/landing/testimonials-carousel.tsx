"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { testimonials } from "@/lib/mathtriumph-content"

export function TestimonialsCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const active = testimonials[index]

  return (
    <Card className="premium-surface overflow-hidden border-teal-200/70 bg-gradient-to-br from-background via-background to-teal-50/40 dark:border-teal-500/30 dark:to-teal-500/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="inline-flex items-center gap-2 text-sm text-amber-600 dark:text-amber-300">
          <Star className="size-4" />
          Student Victory Stories
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() =>
              setIndex((current) =>
                current === 0 ? testimonials.length - 1 : current - 1
              )
            }
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() =>
              setIndex((current) => (current + 1) % testimonials.length)
            }
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="min-h-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.student}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <Quote className="size-5 text-teal-600" />
            <p className="text-lg leading-relaxed">{active.quote}</p>
          </motion.div>
        </AnimatePresence>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <p className="font-medium">{active.student}</p>
        <div className="flex items-center gap-3">
          <p className="text-sm text-muted-foreground">{active.outcome}</p>
          <div className="flex items-center gap-1">
            {testimonials.map((item, dotIndex) => (
              <span
                key={item.student}
                className={`size-1.5 rounded-full ${
                  dotIndex === index ? "bg-teal-500" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
