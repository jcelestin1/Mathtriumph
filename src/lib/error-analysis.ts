import type {
  EocPrediction,
  ErrorAnalysisEntry,
  MisconceptionTag,
  MisconceptionType,
  QuestionResult,
  QuestionWorkEntry,
  QuizDefinition,
  Stream1DraftOutput,
  Stream2DiagnosticOutput,
} from "@/lib/quiz-engine"
import {
  assertPurposeAllowed,
  type AiPurpose,
} from "@/lib/security/ai-governance"

type QuestionContext = {
  questionId: string
  topic: string
  course: "Geometry" | "Algebra 1"
  benchmark: string
  reportingCategory: string
  misconceptionTag: MisconceptionTag
  userAnswer: string
  expectedAnswer: string
  workShown: string
  reasoningNote: string
  confidenceLevel: number
  answerChanges: number
  timeSpentSeconds: number
}

type RemediationTemplate = {
  rootCause: string
  whyThisMatters: string
  quickHint: string
  guidedFix: string[]
  conceptualExample: string
  nextPractice: string
}

function getRemediationTemplate(tag: MisconceptionTag): RemediationTemplate {
  switch (tag) {
    case "angle-pair-name-confusion":
      return {
        rootCause:
          "The student is computing before correctly naming the angle relationship (corresponding/alternate/consecutive interior).",
        whyThisMatters:
          "Florida Geometry EOC angle items are structured around relationship identification before equation setup.",
        quickHint:
          "Name the angle pair first, then decide equal vs supplementary.",
        guidedFix: [
          "Mark parallel lines and the transversal.",
          "Classify the angle pair by position.",
          "Write the equation based on that relationship.",
        ],
        conceptualExample:
          "Corresponding angles are congruent when lines are parallel, so their expressions are set equal.",
        nextPractice:
          "Practice identifying and solving corresponding, alternate interior, and consecutive interior angle equations.",
      }
    case "supplementary-vs-congruent-confusion":
      return {
        rootCause:
          "The student is mixing up when angles should sum to 180 versus when they should be equal.",
        whyThisMatters:
          "This confusion causes consistent misses in transversal and polygon-angle EOC clusters.",
        quickHint:
          "Ask: Is this a matching pair (equal) or a linear/same-side pair (sum to 180)?",
        guidedFix: [
          "Label each angle pair type explicitly.",
          "Use = for congruent pairs and + 180 for supplementary pairs.",
          "Check if the solved value makes geometric sense.",
        ],
        conceptualExample:
          "Alternate interior angles are equal; consecutive interior angles are supplementary.",
        nextPractice:
          "Do mixed sets where each item starts with classifying angle relationship before solving.",
      }
    case "parallel-lines-angle-relationships":
      return {
        rootCause:
          "You treated angle pairs as interchangeable without naming the relationship (corresponding, alternate interior, same-side interior).",
        whyThisMatters:
          "Florida EOC geometry items repeatedly test angle-pair identification before solving equations.",
        quickHint:
          "Name the angle relationship first, then write the equation (equal or supplementary).",
        guidedFix: [
          "Mark which lines are parallel and identify the transversal.",
          "Label the pair type (corresponding/alternate interior/same-side interior).",
          "Write the matching equation and solve only after that.",
        ],
        conceptualExample:
          "If corresponding angles are (3x + 5) and (5x - 9), set them equal because corresponding angles formed by parallel lines are congruent.",
        nextPractice:
          "Practice 8 mixed questions on corresponding vs alternate interior angle equations.",
      }
    case "factoring-quadratics":
      return {
        rootCause:
          "You likely focused on product only and did not verify the middle-term sum/sign pattern.",
        whyThisMatters:
          "Algebra 1 EOC heavily emphasizes quadratic structure and equivalent expression forms.",
        quickHint:
          "Find two numbers that multiply to c and add to b, including signs.",
        guidedFix: [
          "List factor pairs of the constant term.",
          "Test each pair’s sum against the middle coefficient.",
          "Check by re-expanding your factors.",
        ],
        conceptualExample:
          "For x^2 - 7x + 12, use -3 and -4 because (-3)(-4)=12 and -3 + -4 = -7.",
        nextPractice:
          "Complete a set on factoring monic trinomials with negative middle terms.",
      }
    case "formula-substitution":
      return {
        rootCause:
          "You recognized the correct formula family but substituted values incorrectly or dropped a coefficient.",
        whyThisMatters:
          "Geometry reporting categories reward precision with formula substitution and unit interpretation.",
        quickHint:
          "Write the formula symbolically first, then substitute one value at a time.",
        guidedFix: [
          "Rewrite the formula exactly as given (include coefficients like 1/2).",
          "Substitute each known measure with parentheses.",
          "Evaluate multiplication before final simplification.",
        ],
        conceptualExample:
          "Triangle area uses 1/2 * base * height; omitting 1/2 doubles the answer.",
        nextPractice:
          "Practice geometric measurement items where selecting and substituting formulas are both required.",
      }
    case "area-and-perimeter-selection":
      return {
        rootCause:
          "You switched between area and perimeter logic without confirming which quantity the prompt asked for.",
        whyThisMatters:
          "EOC distractors are designed around area/perimeter confusion.",
        quickHint:
          "Circle the measurement word first: area, perimeter, surface area, or volume.",
        guidedFix: [
          "Underline what the problem is asking you to find.",
          "Choose the formula tied to that exact measurement type.",
          "Check units to confirm reasonableness.",
        ],
        conceptualExample:
          "Rectangle area needs square units (l*w); perimeter needs linear units (2l+2w).",
        nextPractice:
          "Work on mixed area vs perimeter identification drills with unit checks.",
      }
    case "multi-step-word-problem-modeling":
      return {
        rootCause:
          "You may have jumped to arithmetic before translating the context into a rate model.",
        whyThisMatters:
          "Algebra EOC tasks often score modeling setup and interpretation, not just arithmetic.",
        quickHint:
          "Find the unit rate first, then scale to the requested quantity.",
        guidedFix: [
          "Identify known quantity and time/units.",
          "Compute the unit rate.",
          "Multiply the unit rate by the target amount.",
        ],
        conceptualExample:
          "If 18 problems in 12 min, then 1.5 problems/min and 45 problems in 30 min.",
        nextPractice:
          "Practice proportional reasoning with tables, equations, and verbal contexts.",
      }
    case "linear-equation-inverse-operations":
      return {
        rootCause:
          "You started inverse operations but did not preserve equality through every step.",
        whyThisMatters:
          "Linear equation fluency is foundational for both Algebra and Geometry EOC equations.",
        quickHint:
          "Do the same operation to both sides and simplify before moving on.",
        guidedFix: [
          "Isolate variable terms first (add/subtract).",
          "Then isolate the variable coefficient (multiply/divide).",
          "Substitute back to verify the solution.",
        ],
        conceptualExample:
          "2x + 11 = 27 becomes 2x = 16, then x = 8.",
        nextPractice:
          "Complete 10 one-variable equations with verification checks.",
      }
    case "triangle-angle-sum":
      return {
        rootCause:
          "You used angle relationships but did not anchor the equation to the 180-degree triangle sum.",
        whyThisMatters:
          "Triangle angle relationships are central in Geometry EOC proofs and equation items.",
        quickHint:
          "Interior angles of a triangle always add to 180 degrees.",
        guidedFix: [
          "Write all known angle expressions.",
          "Set their sum equal to 180.",
          "Solve and validate each angle measure.",
        ],
        conceptualExample:
          "If angles are x, x+20, and 50, solve x + (x+20) + 50 = 180.",
        nextPractice:
          "Practice solving for unknown triangle angles with algebraic expressions.",
      }
    case "triangle-congruence-similarity":
      return {
        rootCause:
          "You matched parts without first proving congruence/similarity criteria.",
        whyThisMatters:
          "Geometry EOC requires criterion-based reasoning before conclusions about sides/angles.",
        quickHint:
          "Name the criterion (SSS, SAS, AA, etc.) before using part relationships.",
        guidedFix: [
          "List given side/angle relationships.",
          "Select the valid congruence or similarity criterion.",
          "Use corresponding parts only after criterion is established.",
        ],
        conceptualExample:
          "AA similarity allows proportional sides; it does not guarantee equal side lengths.",
        nextPractice:
          "Target similarity/congruence matching sets with criterion identification.",
      }
    case "proof-structure-logic-gap":
      return {
        rootCause:
          "The student jumps to a conclusion without citing required geometric statements and reasons.",
        whyThisMatters:
          "Geometry EOC proof-style items require valid logical sequence, not just the final statement.",
        quickHint:
          "Every conclusion in a proof needs a matching reason from definitions, theorems, or givens.",
        guidedFix: [
          "List all givens first.",
          "State each derived fact with its theorem/reason.",
          "Only conclude after the needed chain is complete.",
        ],
        conceptualExample:
          "You cannot claim triangles are congruent without first proving a valid criterion like SAS/SSS/ASA.",
        nextPractice:
          "Practice statement-reason matching for geometry proof fragments.",
      }
    case "slope-and-rate-of-change":
      return {
        rootCause:
          "You treated slope as a raw difference instead of a ratio of vertical change to horizontal change.",
        whyThisMatters:
          "Slope and rate interpretation are recurring Algebra 1 EOC standards.",
        quickHint:
          "Use slope = (y2 - y1)/(x2 - x1), then interpret in context.",
        guidedFix: [
          "Identify ordered pairs clearly.",
          "Compute rise and run with signs.",
          "Simplify and interpret unit meaning.",
        ],
        conceptualExample:
          "From (2,3) to (6,11), slope is (11-3)/(6-2)=8/4=2.",
        nextPractice:
          "Practice rate-of-change in tables, graphs, and verbal contexts.",
      }
    case "slope-vs-perpendicularity-confusion":
      return {
        rootCause:
          "The student is conflating parallel-line slope rules with perpendicular-line slope rules.",
        whyThisMatters:
          "Perpendicularity and slope interpretation are common Algebra and Geometry EOC crossover skills.",
        quickHint:
          "Perpendicular means negative reciprocal; parallel means same slope.",
        guidedFix: [
          "Write the original slope as a fraction.",
          "Take reciprocal and switch sign for perpendicular.",
          "Compare with answer choices to avoid parallel traps.",
        ],
        conceptualExample:
          "If slope is 3/4, perpendicular slope is -4/3, not 3/4 or -3/4.",
        nextPractice:
          "Practice classifying line relationships from equations and slopes.",
      }
    case "function-representation-linking":
      return {
        rootCause:
          "You solved in one representation (equation/table/graph) but did not map it consistently to the others.",
        whyThisMatters:
          "Algebra EOC frequently requires moving between representations.",
        quickHint:
          "Translate each value across equation, table, and graph before answering.",
        guidedFix: [
          "Identify independent/dependent variables.",
          "Generate at least two equivalent representations.",
          "Check if your final claim is true in all forms.",
        ],
        conceptualExample:
          "A y=2x+1 equation should match a table where y increases by 2 for each +1 in x.",
        nextPractice:
          "Work on function items requiring graph-table-equation matching.",
      }
    default:
      return {
        rootCause:
          "The approach was partially correct, but one key step did not align with the benchmark expectation.",
        whyThisMatters:
          "EOC scoring rewards accurate process and benchmark-aligned reasoning.",
        quickHint: "State the relationship/rule before computing.",
        guidedFix: [
          "Restate what the problem asks for.",
          "Choose and justify the rule/formula.",
          "Solve and verify with the context.",
        ],
        conceptualExample:
          "A correct setup can still miss the answer if one operation or substitution is skipped.",
        nextPractice:
          "Practice mixed benchmark items focusing on setup justification before calculation.",
      }
  }
}

function getErrorType(ctx: QuestionContext): MisconceptionType {
  const answer = ctx.userAnswer.trim()
  const workLength = ctx.workShown.trim().length
  const reasoningLength = ctx.reasoningNote.trim().length

  if (!answer) return "strategic"
  if (ctx.answerChanges >= 3 && ctx.confidenceLevel <= 2) return "careless"
  if (workLength < 12 && reasoningLength < 12) return "strategic"
  if (ctx.confidenceLevel >= 4 && answer !== ctx.expectedAnswer) return "conceptual"
  if (ctx.timeSpentSeconds <= 20) return "careless"
  return "procedural"
}

function getNeutralReasoningSummary(ctx: QuestionContext) {
  const work = ctx.workShown.trim() || "No step-by-step work was entered."
  const reasoning = ctx.reasoningNote.trim() || "No reasoning note was entered."
  return `Student submitted "${ctx.userAnswer || "No answer"}". They recorded work as: ${work}. Their reasoning note was: ${reasoning}. Confidence selected: ${ctx.confidenceLevel || 0}/5, answer changes: ${ctx.answerChanges}, time spent: ${ctx.timeSpentSeconds}s.`
}

function getDivergencePoint(ctx: QuestionContext, errorType: MisconceptionType) {
  if (!ctx.userAnswer.trim()) {
    return "The student did not provide a final answer, so the solution path does not reach a verifiable result."
  }
  if (errorType === "conceptual") {
    return "The divergence occurred at rule selection: the student used an incorrect relationship or interpretation before computing."
  }
  if (errorType === "procedural") {
    return "The divergence occurred during execution: setup appears partially correct, but arithmetic/algebraic processing produced a mismatched result."
  }
  if (errorType === "careless") {
    return "The divergence occurred in precision: signs, substitutions, or simplification checks were likely skipped."
  }
  return "The divergence occurred in strategy: the work does not include a complete benchmark-aligned setup."
}

function parseOperations(text: string) {
  const lower = text.toLowerCase()
  const operations = [
    "subtracted",
    "added",
    "divided",
    "multiplied",
    "factored",
    "substituted",
    "set equal",
    "set to 180",
    "used slope",
  ]
  return operations.filter((op) => lower.includes(op.split(" ")[0]))
}

function buildStream1Draft(ctx: QuestionContext): Stream1DraftOutput {
  const work = ctx.workShown.trim()
  const reasoning = ctx.reasoningNote.trim()
  const neutralSteps: string[] = []

  neutralSteps.push(
    `Student entered final answer: ${ctx.userAnswer || "No answer"}`
  )
  neutralSteps.push(
    work ? `Work shown: ${work}` : "No step-by-step work entered by student."
  )
  neutralSteps.push(
    reasoning
      ? `Reasoning note: ${reasoning}`
      : "No separate reasoning note was provided."
  )
  neutralSteps.push(
    `Confidence ${ctx.confidenceLevel}/5 with ${ctx.answerChanges} answer changes in ${ctx.timeSpentSeconds}s.`
  )

  const assumptionsNoted: string[] = []
  if (!work) assumptionsNoted.push("No explicit operations shown.")
  if (!reasoning) assumptionsNoted.push("No explicit theorem/rule justification.")
  if (ctx.timeSpentSeconds <= 20) assumptionsNoted.push("Very fast response time.")

  return {
    questionId: ctx.questionId,
    neutralSteps,
    extractedOperations: parseOperations(`${work} ${reasoning}`),
    assumptionsNoted,
    submittedAnswer: ctx.userAnswer || "No answer",
    confidenceLevel: ctx.confidenceLevel,
    timeSpentSeconds: ctx.timeSpentSeconds,
  }
}

function buildStream2Diagnostic(
  ctx: QuestionContext,
  stream1: Stream1DraftOutput
): Stream2DiagnosticOutput {
  const errorType = getErrorType(ctx)
  const template = getRemediationTemplate(ctx.misconceptionTag)

  return {
    divergencePoint: getDivergencePoint(ctx, errorType),
    errorType,
    misconceptionTag: ctx.misconceptionTag,
    benchmark: ctx.benchmark,
    reportingCategory: ctx.reportingCategory,
    rootCause: template.rootCause,
    socraticPrompts: [
      `Which relationship should be identified first before solving (given operations: ${
        stream1.extractedOperations.join(", ") || "none captured"
      })?`,
      "How can you verify whether this pair should be congruent or supplementary?",
      "What check confirms your final value is consistent with the context and benchmark rule?",
    ],
    remediationLevels: {
      quickHint: template.quickHint,
      guidedFix: template.guidedFix,
      conceptualExample: template.conceptualExample,
    },
    whyThisMattersForEoc: template.whyThisMatters,
  }
}

function mapLevelFromScale(score: number): 1 | 2 | 3 | 4 | 5 {
  if (score >= 430) return 5
  if (score >= 410) return 4
  if (score >= 390) return 3
  if (score >= 370) return 2
  return 1
}

export function buildEocPrediction(
  scorePercent: number,
  analyses: ErrorAnalysisEntry[],
  options?: { purpose?: AiPurpose }
): EocPrediction {
  if (options?.purpose) {
    assertPurposeAllowed(options.purpose)
  }
  const baseScale = Math.round(325 + scorePercent * 1.15)
  const penalty = analyses.reduce((sum, item) => {
    if (item.errorType === "conceptual") return sum + 8
    if (item.errorType === "strategic") return sum + 6
    if (item.errorType === "procedural") return sum + 4
    return sum + 2
  }, 0)

  const projectedScaleScore = Math.max(325, Math.min(475, baseScale - penalty))
  const achievementLevel = mapLevelFromScale(projectedScaleScore)
  const conceptualCount = analyses.filter((item) => item.errorType === "conceptual").length
  const strategicCount = analyses.filter((item) => item.errorType === "strategic").length
  const confidenceBand: "low" | "medium" | "high" =
    conceptualCount >= 2 || strategicCount >= 2
      ? "low"
      : analyses.length >= 2
        ? "medium"
        : "high"
  const requiresHumanReview = achievementLevel <= 2 || confidenceBand === "low"
  const topRiskReportingCategories = Array.from(
    analyses.reduce((map, item) => {
      map.set(item.reportingCategory, (map.get(item.reportingCategory) ?? 0) + 1)
      return map
    }, new Map<string, number>())
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category)

  return {
    projectedScaleScore,
    achievementLevel,
    confidenceBand,
    requiresHumanReview,
    topRiskReportingCategories,
    rationale:
      analyses.length > 0
        ? `Projection discounts for ${analyses.length} diagnosed misconception(s), weighted by error severity and type.`
        : "Projection based on current score trend with no active misconceptions detected.",
  }
}

export function buildErrorAnalyses({
  quiz,
  results,
  questionWork,
}: {
  quiz: QuizDefinition
  results: QuestionResult[]
  questionWork: QuestionWorkEntry[]
}) {
  const workByQuestion = new Map(
    questionWork.map((entry) => [entry.questionId, entry] as const)
  )

  return results
    .filter((result) => !result.isCorrect)
    .map((result) => {
      const question = quiz.questions.find((item) => item.id === result.questionId)
      const workEntry = workByQuestion.get(result.questionId)
      if (!question) return null

      const context: QuestionContext = {
        questionId: result.questionId,
        topic: result.topic,
        course: question.course,
        benchmark: question.bestBenchmark,
        reportingCategory: question.reportingCategory,
        misconceptionTag: question.misconceptionFocusTag,
        userAnswer: result.userAnswer,
        expectedAnswer: result.expectedAnswer,
        workShown: workEntry?.workShown ?? "",
        reasoningNote: workEntry?.reasoningNote ?? "",
        confidenceLevel: workEntry?.confidenceLevel ?? result.confidenceLevel ?? 0,
        answerChanges: workEntry?.answerChanges ?? 0,
        timeSpentSeconds: workEntry?.timeSpentSeconds ?? 0,
      }

      const stream1Draft = buildStream1Draft(context)
      const stream2Diagnostic = buildStream2Diagnostic(context, stream1Draft)

      return {
        questionId: context.questionId,
        topic: context.topic,
        course: context.course,
        benchmark: context.benchmark,
        reportingCategory: context.reportingCategory,
        stream1ReasoningSummary: getNeutralReasoningSummary(context),
        divergencePoint: stream2Diagnostic.divergencePoint,
        errorType: stream2Diagnostic.errorType,
        misconceptionTag: context.misconceptionTag,
        rootCause: stream2Diagnostic.rootCause,
        whyThisMatters: stream2Diagnostic.whyThisMattersForEoc,
        quickHint: stream2Diagnostic.remediationLevels.quickHint,
        guidedFix: stream2Diagnostic.remediationLevels.guidedFix,
        conceptualExample: stream2Diagnostic.remediationLevels.conceptualExample,
        nextPractice: getRemediationTemplate(context.misconceptionTag).nextPractice,
        stream1Draft,
        stream2Diagnostic,
      } satisfies ErrorAnalysisEntry
    })
    .filter((item): item is ErrorAnalysisEntry => Boolean(item))
}

export function buildDualStreamPrompt(entry: ErrorAnalysisEntry) {
  return [
    "Stream 1 - Draft Analyzer JSON:",
    JSON.stringify(entry.stream1Draft, null, 2),
    "",
    "Stream 2 - Diagnostic Analyzer JSON:",
    JSON.stringify(entry.stream2Diagnostic, null, 2),
  ].join("\n")
}
