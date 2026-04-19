import type { LucideIcon } from "lucide-react"
import {
  BrainCircuit,
  Clock3,
  LineChart,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react"

export type QuizQuestion = {
  id: string
  topic: string
  prompt: string
  formula?: string
  options: string[]
  correctAnswer: string
  explanation: string
}

export type Testimonial = {
  quote: string
  student: string
  outcome: string
}

export type Feature = {
  title: string
  description: string
  icon: LucideIcon
}

export type Plan = {
  name: string
  price: string
  cadence: string
  description: string
  highlights: string[]
  cta: string
  featured?: boolean
}

export const trustStats = [
  "Trusted by 50,000+ students and 1,200+ educators",
  "Average assessment growth: +18% in 6 weeks",
  "Family-friendly reporting trusted by parents and school leaders",
]

export const quizQuestions: QuizQuestion[] = [
  {
    id: "algebra-linear",
    topic: "Algebra",
    prompt: "Solve for x in 3x - 7 = 20.",
    options: ["x = 7", "x = 8", "x = 9", "x = 10"],
    correctAnswer: "x = 9",
    explanation:
      "Add 7 to both sides to get 3x = 27, then divide by 3. This isolates x cleanly.",
  },
  {
    id: "geometry-area",
    topic: "Geometry",
    prompt: "A triangle has base 10 and height 6. What is its area?",
    formula: "A = \\frac{1}{2}bh",
    options: ["16", "24", "30", "60"],
    correctAnswer: "30",
    explanation:
      "Use A = 1/2 × b × h = 1/2 × 10 × 6 = 30 square units.",
  },
  {
    id: "word-problem-rate",
    topic: "Word Problem",
    prompt:
      "A student answers 18 questions in 12 minutes. At the same rate, how many in 30 minutes?",
    options: ["36", "40", "45", "48"],
    correctAnswer: "45",
    explanation:
      "Rate is 18/12 = 1.5 questions per minute. In 30 minutes: 1.5 × 30 = 45.",
  },
  {
    id: "sat-quadratic",
    topic: "SAT Style",
    prompt: "If x² - 5x + 6 = 0, what are the solutions?",
    formula: "x^2 - 5x + 6 = (x-2)(x-3)",
    options: ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = 0, 5"],
    correctAnswer: "x = 2, 3",
    explanation:
      "Factor the quadratic into (x - 2)(x - 3)=0, then apply zero-product property.",
  },
  {
    id: "ap-calculus-limit",
    topic: "AP Calculus",
    prompt: "Evaluate lim x→2 of (x² - 4)/(x - 2).",
    formula: "\\lim_{x\\to2}\\frac{x^2-4}{x-2}",
    options: ["0", "2", "4", "Undefined"],
    correctAnswer: "4",
    explanation:
      "Factor numerator: (x - 2)(x + 2). Cancel x - 2, then evaluate x + 2 at x = 2.",
  },
]

export const featureCards: Feature[] = [
  {
    title: "Adaptive Skill Mastery",
    description:
      "Dynamic practice adjusts to each learner so weak skills become reliable strengths.",
    icon: BrainCircuit,
  },
  {
    title: "Realistic Timed Assessments",
    description:
      "Train under authentic pressure with pacing cues and exam-style section breakdowns.",
    icon: Clock3,
  },
  {
    title: "Instant AI Explanations",
    description:
      "Get clear, step-by-step reasoning immediately after each attempt to lock in understanding.",
    icon: Sparkles,
  },
  {
    title: "Personalized Triumph Plans",
    description:
      "Receive a weekly plan mapped to your exam date, score goal, and highest-impact topics.",
    icon: Target,
  },
  {
    title: "Victory Streak Analytics",
    description:
      "Track consistency, confidence, and momentum with visual streaks and mastery rings.",
    icon: LineChart,
  },
  {
    title: "Score Predictor & Tracker",
    description:
      "Estimate future performance and see which actions create the largest score lift.",
    icon: TrendingUp,
  },
]

export const howItWorks = [
  "Take a quick Triumph diagnostic to reveal your strongest and weakest standards.",
  "Train with adaptive sets and realistic timed drills that mirror your exam format.",
  "Review instant explanations and retry misses until each target skill is mastered.",
  "Enter test day with a personalized plan, confidence, and measurable Triumph momentum.",
]

export const testimonials: Testimonial[] = [
  {
    quote:
      "I jumped from 620 to 780 on SAT Math in six weeks. The daily streak and coaching feedback kept me locked in.",
    student: "Maya L.",
    outcome: "SAT Math +160",
  },
  {
    quote:
      "I aced AP Calculus BC after 3 weeks of focused review. The visual explanations finally made derivatives click.",
    student: "Jordan T.",
    outcome: "AP Calculus BC: 5",
  },
  {
    quote:
      "As a parent, I can actually see where my daughter is improving and what to reinforce each week.",
    student: "Mrs. Rivera",
    outcome: "Family confidence + school alignment",
  },
  {
    quote:
      "I finally understood quadratics and got an A on my final. It felt like I could actually win at math.",
    student: "Nia R.",
    outcome: "Course Grade: A",
  },
]

export const pricingPlans: Plan[] = [
  {
    name: "Free Starter",
    price: "$0",
    cadence: "always free",
    description: "Perfect for trying the platform and building your first streak.",
    highlights: [
      "3 adaptive practice sets per week",
      "Basic score insights",
      "1 mini Triumph quiz per day",
    ],
    cta: "Start Free",
  },
  {
    name: "Pro Triumph",
    price: "$12",
    cadence: "/mo billed annually",
    description: "For serious score growth and full assessment prep power.",
    highlights: [
      "Unlimited timed assessments",
      "Personalized Triumph plans",
      "Advanced score predictor",
      "Priority AI explanations",
    ],
    cta: "Go Pro",
    featured: true,
  },
  {
    name: "Family / School Plan",
    price: "Custom",
    cadence: "multi-seat",
    description: "Ideal for families, tutors, and schools supporting many learners.",
    highlights: [
      "Multi-student analytics dashboard",
      "Class and cohort performance views",
      "Progress reports for guardians",
      "Dedicated onboarding support",
    ],
    cta: "Contact Team",
  },
]

export const faqs = [
  {
    question: "What exams does MathTriumph support?",
    answer:
      "MathTriumph is built for school assessments, finals, SAT/ACT Math, and AP-level prep. Students can focus by topic or by full test format.",
  },
  {
    question: "How quickly can score improvements happen?",
    answer:
      "Most students report measurable confidence and score gains in 2 to 6 weeks when following their personalized Triumph plan consistently.",
  },
  {
    question: "Is this beginner-friendly?",
    answer:
      "Yes. The platform adapts difficulty and provides guided explanations so learners at different levels can make steady progress.",
  },
  {
    question: "Can parents and teachers track progress?",
    answer:
      "Yes. Family and school plans include progress dashboards, streak tracking, and skill-by-skill performance summaries.",
  },
]
