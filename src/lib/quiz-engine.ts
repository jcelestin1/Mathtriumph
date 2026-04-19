export type QuestionType = "multiple_choice" | "free_response"
export type EocCourse = "Geometry" | "Algebra 1"
export type MisconceptionType =
  | "procedural"
  | "conceptual"
  | "careless"
  | "strategic"
export type MisconceptionTag =
  | "angle-pair-name-confusion"
  | "supplementary-vs-congruent-confusion"
  | "parallel-lines-angle-relationships"
  | "triangle-angle-sum"
  | "triangle-congruence-similarity"
  | "proof-structure-logic-gap"
  | "area-and-perimeter-selection"
  | "slope-and-rate-of-change"
  | "slope-vs-perpendicularity-confusion"
  | "linear-equation-inverse-operations"
  | "factoring-quadratics"
  | "function-representation-linking"
  | "formula-substitution"
  | "multi-step-word-problem-modeling"

type Explanation = {
  concept: string
  steps: string[]
  commonMistake: string
}

type QuizQuestionBase = {
  id: string
  topic: string
  course: EocCourse
  bestBenchmark: string
  reportingCategory: string
  misconceptionFocusTag: MisconceptionTag
  prompt: string
  formula?: string
  type: QuestionType
  explanation: Explanation
}

export type MultipleChoiceQuestion = QuizQuestionBase & {
  type: "multiple_choice"
  options: string[]
  correctAnswer: string
}

export type FreeResponseQuestion = QuizQuestionBase & {
  type: "free_response"
  acceptableAnswers: string[]
}

export type QuizQuestion = MultipleChoiceQuestion | FreeResponseQuestion

export type QuizDefinition = {
  id: string
  title: string
  subtitle: string
  durationMinutes: number
  topics: string[]
  questions: QuizQuestion[]
}

export type QuestionResult = {
  questionId: string
  topic: string
  course?: EocCourse
  bestBenchmark?: string
  reportingCategory?: string
  isCorrect: boolean
  userAnswer: string
  expectedAnswer: string
  confidenceLevel?: number
}

export type QuestionWorkEntry = {
  questionId: string
  workShown: string
  reasoningNote: string
  confidenceLevel: number
  answerChanges: number
  timeSpentSeconds: number
}

export type AntiCheatFlag = {
  id: string
  label: string
  detail: string
  severity: "low" | "medium" | "high"
}

export type IntegrityReviewStatus = "pending" | "acknowledged" | "escalated"

export type IntegrityReview = {
  status: IntegrityReviewStatus
  reviewedAt?: string
  notes?: string
}

export type ErrorAnalysisEntry = {
  questionId: string
  topic: string
  course: EocCourse
  benchmark: string
  reportingCategory: string
  stream1ReasoningSummary: string
  divergencePoint: string
  errorType: MisconceptionType
  misconceptionTag: MisconceptionTag
  rootCause: string
  whyThisMatters: string
  quickHint: string
  guidedFix: string[]
  conceptualExample: string
  nextPractice: string
  stream1Draft: Stream1DraftOutput
  stream2Diagnostic: Stream2DiagnosticOutput
}

export type Stream1DraftOutput = {
  questionId: string
  neutralSteps: string[]
  extractedOperations: string[]
  assumptionsNoted: string[]
  submittedAnswer: string
  confidenceLevel: number
  timeSpentSeconds: number
}

export type Stream2DiagnosticOutput = {
  divergencePoint: string
  errorType: MisconceptionType
  misconceptionTag: MisconceptionTag
  benchmark: string
  reportingCategory: string
  rootCause: string
  socraticPrompts: string[]
  remediationLevels: {
    quickHint: string
    guidedFix: string[]
    conceptualExample: string
  }
  whyThisMattersForEoc: string
}

export type EocPrediction = {
  projectedScaleScore: number
  achievementLevel: 1 | 2 | 3 | 4 | 5
  rationale: string
  confidenceBand?: "low" | "medium" | "high"
  requiresHumanReview?: boolean
  topRiskReportingCategories?: string[]
}

export type QuizAttempt = {
  attemptId: string
  quizId: string
  role:
    | "district_admin"
    | "school_admin"
    | "tech_admin"
    | "interventionist"
    | "instructional_coach"
    | "data_analyst"
    | "teacher"
    | "student"
    | "parent"
    | "support_admin"
  startedAt: string
  completedAt: string
  elapsedSeconds: number
  scorePercent: number
  answers: Record<string, string>
  results: QuestionResult[]
  questionWork: QuestionWorkEntry[]
  antiCheatFlags: AntiCheatFlag[]
  oralVerificationPrompts: string[]
  integrityReview?: IntegrityReview
  errorAnalyses?: ErrorAnalysisEntry[]
  eocPrediction?: EocPrediction
}

const algebraGeometryFoundations: QuizDefinition = {
  id: "algebra-geometry-foundations",
  title: "Algebra + Geometry Foundations",
  subtitle:
    "Build core confidence with mixed question types and step-by-step corrections.",
  durationMinutes: 12,
  topics: ["Algebra", "Geometry", "Word Problems"],
  questions: [
    {
      id: "q1",
      topic: "Algebra",
      course: "Algebra 1",
      bestBenchmark: "MA.912.AR.2.1",
      reportingCategory: "Algebra and Modeling",
      misconceptionFocusTag: "linear-equation-inverse-operations",
      prompt: "Solve for x: 2x + 11 = 27",
      type: "multiple_choice",
      options: ["x = 6", "x = 7", "x = 8", "x = 9"],
      correctAnswer: "x = 8",
      explanation: {
        concept: "Isolate the variable using inverse operations.",
        steps: [
          "Subtract 11 from both sides: 2x = 16",
          "Divide both sides by 2: x = 8",
        ],
        commonMistake:
          "Forgetting to divide both sides after subtracting can leave the equation incomplete.",
      },
    },
    {
      id: "q2",
      topic: "Geometry",
      course: "Geometry",
      bestBenchmark: "MA.912.GR.3.1",
      reportingCategory: "Geometric Measurement and Data",
      misconceptionFocusTag: "area-and-perimeter-selection",
      prompt: "A rectangle has length 9 and width 4. What is its area?",
      formula: "A = l \\times w",
      type: "free_response",
      acceptableAnswers: ["36", "36 square units"],
      explanation: {
        concept: "Area of a rectangle is the product of length and width.",
        steps: ["Substitute values: A = 9 × 4", "Compute: A = 36"],
        commonMistake:
          "Mixing up area and perimeter leads to adding instead of multiplying.",
      },
    },
    {
      id: "q3",
      topic: "Word Problems",
      course: "Algebra 1",
      bestBenchmark: "MA.912.AR.1.5",
      reportingCategory: "Algebra and Modeling",
      misconceptionFocusTag: "multi-step-word-problem-modeling",
      prompt:
        "A student solves 15 problems in 10 minutes. At the same rate, how many problems in 30 minutes?",
      type: "multiple_choice",
      options: ["30", "40", "45", "50"],
      correctAnswer: "45",
      explanation: {
        concept: "Use unit rate then scale.",
        steps: [
          "Find rate: 15 ÷ 10 = 1.5 problems/minute",
          "Scale to 30 minutes: 1.5 × 30 = 45",
        ],
        commonMistake:
          "Using 30 as a multiplier directly without first computing per-minute rate.",
      },
    },
    {
      id: "q4",
      topic: "Algebra",
      course: "Algebra 1",
      bestBenchmark: "MA.912.AR.3.2",
      reportingCategory: "Algebra and Functions",
      misconceptionFocusTag: "factoring-quadratics",
      prompt: "Factor: x² - 7x + 12",
      formula: "x^2 - 7x + 12",
      type: "free_response",
      acceptableAnswers: ["(x-3)(x-4)", "(x - 3)(x - 4)"],
      explanation: {
        concept:
          "Find two numbers that multiply to +12 and add to -7: -3 and -4.",
        steps: [
          "Split middle term: x² - 3x - 4x + 12",
          "Factor by grouping: x(x-3) - 4(x-3)",
          "Final: (x-3)(x-4)",
        ],
        commonMistake:
          "Choosing +3 and +4 because they multiply to 12 but ignoring the negative middle term.",
      },
    },
    {
      id: "q5",
      topic: "Geometry",
      course: "Geometry",
      bestBenchmark: "MA.912.GR.3.2",
      reportingCategory: "Geometric Measurement and Data",
      misconceptionFocusTag: "formula-substitution",
      prompt: "A triangle has base 12 and height 5. What is its area?",
      formula: "A = \\frac{1}{2}bh",
      type: "multiple_choice",
      options: ["24", "30", "34", "60"],
      correctAnswer: "30",
      explanation: {
        concept:
          "Triangle area is half of base times height, not full base × height.",
        steps: ["Substitute: A = 1/2 × 12 × 5", "Compute: A = 30"],
        commonMistake:
          "Forgetting the 1/2 factor gives 60, which is the rectangle area, not triangle area.",
      },
    },
    {
      id: "q6",
      topic: "Geometry",
      course: "Geometry",
      bestBenchmark: "MA.912.GR.2.1",
      reportingCategory: "Congruence, Similarity, Right Triangles, and Trigonometry",
      misconceptionFocusTag: "angle-pair-name-confusion",
      prompt:
        "Two parallel lines are cut by a transversal. One corresponding angle is 3x + 8 and the matching angle is 5x - 14. Solve for x.",
      type: "multiple_choice",
      options: ["x = 10", "x = 11", "x = 12", "x = 13"],
      correctAnswer: "x = 11",
      explanation: {
        concept:
          "Corresponding angles formed by a transversal with parallel lines are congruent.",
        steps: [
          "Set expressions equal: 3x + 8 = 5x - 14",
          "Move terms: 22 = 2x",
          "Solve: x = 11",
        ],
        commonMistake:
          "Treating corresponding angles as supplementary (sum to 180) instead of congruent.",
      },
    },
    {
      id: "q7",
      topic: "Geometry",
      course: "Geometry",
      bestBenchmark: "MA.912.GR.2.4",
      reportingCategory: "Congruence, Similarity, Right Triangles, and Trigonometry",
      misconceptionFocusTag: "slope-vs-perpendicularity-confusion",
      prompt:
        "Line m has slope 3/4. Which slope makes line n perpendicular to line m?",
      type: "multiple_choice",
      options: ["4/3", "-3/4", "-4/3", "3/4"],
      correctAnswer: "-4/3",
      explanation: {
        concept:
          "Perpendicular lines have slopes that are negative reciprocals of each other.",
        steps: [
          "Start with slope 3/4",
          "Take reciprocal: 4/3",
          "Change sign: -4/3",
        ],
        commonMistake:
          "Using the same slope or only changing sign without taking reciprocal.",
      },
    },
  ],
}

export const quizCatalog: Record<string, QuizDefinition> = {
  [algebraGeometryFoundations.id]: algebraGeometryFoundations,
}

export function getAllQuizzes() {
  return Object.values(quizCatalog)
}

export function getQuizById(id: string) {
  return quizCatalog[id]
}

function normalizeAnswer(value: string) {
  return value.toLowerCase().replace(/\s+/g, " ").trim()
}

export function evaluateQuestion(question: QuizQuestion, answer: string) {
  const normalizedAnswer = normalizeAnswer(answer)
  if (question.type === "multiple_choice") {
    return normalizedAnswer === normalizeAnswer(question.correctAnswer)
  }

  return question.acceptableAnswers.some(
    (validAnswer) => normalizeAnswer(validAnswer) === normalizedAnswer
  )
}

export function getExpectedAnswerLabel(question: QuizQuestion) {
  if (question.type === "multiple_choice") {
    return question.correctAnswer
  }
  return question.acceptableAnswers[0]
}

function hashSeed(seed: string) {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

function seededRandomFactory(seed: string) {
  let value = hashSeed(seed) || 1
  return () => {
    value = (value * 1664525 + 1013904223) % 4294967296
    return value / 4294967296
  }
}

function shuffleArray<T>(input: T[], random: () => number) {
  const cloned = [...input]
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[cloned[i], cloned[j]] = [cloned[j], cloned[i]]
  }
  return cloned
}

export function createSessionQuiz(quiz: QuizDefinition, seed: string): QuizDefinition {
  const random = seededRandomFactory(`${quiz.id}-${seed}`)
  const shuffledQuestions = shuffleArray(quiz.questions, random).map((question) => {
    if (question.type === "multiple_choice") {
      return {
        ...question,
        options: shuffleArray(question.options, random),
      }
    }
    return question
  })

  return {
    ...quiz,
    questions: shuffledQuestions,
  }
}
