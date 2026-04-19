export type ManagerRole = "teacher" | "school_admin"

export const managerKpis = [
  { label: "Total Students", value: "1,248", trend: "+6.4% vs last month" },
  {
    label: "Avg Score Improvement",
    value: "+18%",
    trend: "+2.1% this reporting period",
  },
  { label: "Active Weekly Learners", value: "892", trend: "+11.9% engagement" },
  { label: "Intervention Completion", value: "74%", trend: "+8.0% completion rate" },
]

export const scoreTrendData = [
  { week: "W1", actualScore: 61, predictedScore: 63 },
  { week: "W2", actualScore: 64, predictedScore: 66 },
  { week: "W3", actualScore: 66, predictedScore: 68 },
  { week: "W4", actualScore: 69, predictedScore: 71 },
  { week: "W5", actualScore: 72, predictedScore: 73 },
  { week: "W6", actualScore: 74, predictedScore: 75 },
  { week: "W7", actualScore: 76, predictedScore: 77 },
  { week: "W8", actualScore: 79, predictedScore: 80 },
]

export const topicMasteryData = [
  { topic: "Algebra", mastered: 82, needsWork: 18 },
  { topic: "Geometry", mastered: 74, needsWork: 26 },
  { topic: "Probability", mastered: 79, needsWork: 21 },
  { topic: "Functions", mastered: 76, needsWork: 24 },
]

export const gradeDistributionData = [
  { name: "A Range", value: 24 },
  { name: "B Range", value: 38 },
  { name: "C Range", value: 26 },
  { name: "D/F", value: 12 },
]

export const weeklyActivityData = [
  { day: "Mon", sessions: 164 },
  { day: "Tue", sessions: 188 },
  { day: "Wed", sessions: 173 },
  { day: "Thu", sessions: 195 },
  { day: "Fri", sessions: 182 },
  { day: "Sat", sessions: 112 },
  { day: "Sun", sessions: 98 },
]

export const managerStudents = [
  {
    id: "S-001",
    name: "Alex Carter",
    className: "Algebra I - A",
    avgScore: 84,
    weakTopic: "Geometry Proofs",
    intervention: "Assign targeted proof sequence + 2 guided videos",
    streak: 9,
    badges: 4,
  },
  {
    id: "S-002",
    name: "Mia Lopez",
    className: "Algebra I - A",
    avgScore: 73,
    weakTopic: "Linear Systems",
    intervention: "Push mini diagnostic and reteach substitution method",
    streak: 5,
    badges: 2,
  },
  {
    id: "S-003",
    name: "Noah Patel",
    className: "Geometry - B",
    avgScore: 67,
    weakTopic: "Transformations",
    intervention: "Schedule intervention block + interactive transformation drill",
    streak: 3,
    badges: 1,
  },
  {
    id: "S-004",
    name: "Olivia Reed",
    className: "Geometry - B",
    avgScore: 91,
    weakTopic: "Word Problems",
    intervention: "Stretch challenge with SAT multi-step prompts",
    streak: 14,
    badges: 7,
  },
]

export const recentManagerActivity = [
  "Ms. Bennett assigned 'SAT Algebra Sprint' to 2 classes",
  "15 students completed Geometry challenge in the last hour",
  "School benchmark report generated for Quarter 3",
  "3 students earned the 'Perfect Week' badge today",
]

export const livePracticingStudents = [
  "A. Carter - Timed Algebra Set (8 min remaining)",
  "M. Lopez - Geometry Mastery Drill",
  "N. Patel - ACT Math Mixed Review",
  "O. Reed - AP Functions Challenge",
]

export const managerAiInsights = [
  "Geometry transformation errors are 23% higher in Class C than school average.",
  "Students with a 7+ day streak improved an average of 12 points faster.",
  "Targeted intervention on linear systems could move 18 students into proficiency.",
]

export const studentHeader = {
  greeting: "Good morning, Alex!",
  streak: 7,
  weeklyXp: 1240,
  mastery: 87,
}

export const studentOverviewCards = [
  { label: "Overall Math Mastery", value: 87, helper: "You're 87% there." },
  {
    label: "Grade Projection",
    value: 91,
    helper: "Projected A- with current pace.",
  },
  {
    label: "Predicted Assessment Score",
    value: 780,
    helper: "SAT Math predictor range: 760-800.",
  },
]

export const studentSkills = [
  { id: "skill-1", topic: "Quadratic Equations", mastery: 92, strength: "strong" },
  { id: "skill-2", topic: "Trigonometry", mastery: 74, strength: "weak" },
  { id: "skill-3", topic: "Probability", mastery: 81, strength: "strong" },
  { id: "skill-4", topic: "Functions", mastery: 69, strength: "weak" },
  { id: "skill-5", topic: "Geometry Proofs", mastery: 63, strength: "weak" },
  { id: "skill-6", topic: "Data Interpretation", mastery: 85, strength: "strong" },
]

export const studentAssessments = [
  { name: "SAT Algebra Sprint", score: 78, duration: "17 min", topics: "Algebra" },
  { name: "Geometry Core Drill", score: 72, duration: "15 min", topics: "Geometry" },
  { name: "ACT Mixed Set", score: 81, duration: "20 min", topics: "Mixed Skills" },
  { name: "AP Functions Review", score: 88, duration: "16 min", topics: "Functions" },
  { name: "Probability Challenge", score: 84, duration: "14 min", topics: "Probability" },
]

export const studentScoreTrend = [
  { test: "1", actual: 62, predicted: 64 },
  { test: "2", actual: 65, predicted: 66 },
  { test: "3", actual: 67, predicted: 68 },
  { test: "4", actual: 70, predicted: 71 },
  { test: "5", actual: 72, predicted: 73 },
  { test: "6", actual: 74, predicted: 75 },
  { test: "7", actual: 76, predicted: 77 },
  { test: "8", actual: 79, predicted: 80 },
  { test: "9", actual: 83, predicted: 84 },
  { test: "10", actual: 86, predicted: 88 },
]

export const studentBadges = [
  "Algebra Ace",
  "Perfect Week",
  "Speed Solver",
  "Consistency Champion",
]

export const leaderboard = [
  { rank: 1, name: "Olivia R.", points: 1840 },
  { rank: 2, name: "Alex C.", points: 1725 },
  { rank: 3, name: "Mia L.", points: 1655 },
  { rank: 4, name: "Noah P.", points: 1540 },
  { rank: 5, name: "Jordan T.", points: 1490 },
]

export const parentChildren = [
  {
    id: "alex",
    name: "Alex Rivera",
    grade: "Grade 10",
    mastery: 88,
    recentScore: 92,
    streak: 7,
  },
  {
    id: "sarah",
    name: "Sarah Rivera",
    grade: "Grade 8",
    mastery: 79,
    recentScore: 84,
    streak: 5,
  },
]

export const parentTrendData = [
  { day: "Day 1", actual: 68, predicted: 69 },
  { day: "Day 5", actual: 70, predicted: 71 },
  { day: "Day 10", actual: 73, predicted: 74 },
  { day: "Day 15", actual: 75, predicted: 76 },
  { day: "Day 20", actual: 78, predicted: 79 },
  { day: "Day 25", actual: 80, predicted: 82 },
  { day: "Day 30", actual: 83, predicted: 85 },
]

export const parentActivityFeed = [
  "Alex completed Geometry Quiz - 94%",
  "Sarah improved +12% in Algebra this week",
  "Alex earned the 'Consistency Champion' badge",
  "Sarah completed SAT-style word problem set",
]

export const parentRecommendations = [
  "Alex should focus on Trigonometry this week - suggested 2 targeted drills.",
  "Sarah benefits most from short daily algebra practice blocks (12-15 minutes).",
  "Family mastery increased 9% this month; maintain current practice cadence.",
]

export const parentChildDetails = {
  alex: {
    strong: [
      { topic: "Linear Functions", mastery: 93 },
      { topic: "Probability", mastery: 89 },
    ],
    needsFocus: [
      { topic: "Trigonometry", mastery: 71 },
      { topic: "Proof Logic", mastery: 68 },
    ],
    assessments: [
      {
        name: "Geometry Benchmark Set",
        score: 94,
        teacherNote: "Excellent precision. Review proof sequencing for full mastery.",
      },
      {
        name: "SAT Algebra Sprint",
        score: 90,
        teacherNote: "Great pacing improvements; keep practicing multi-step equations.",
      },
    ],
  },
  sarah: {
    strong: [
      { topic: "Ratios & Proportions", mastery: 87 },
      { topic: "Data Interpretation", mastery: 84 },
    ],
    needsFocus: [
      { topic: "Algebraic Expressions", mastery: 72 },
      { topic: "Inequalities", mastery: 69 },
    ],
    assessments: [
      {
        name: "Algebra Skills Check",
        score: 84,
        teacherNote: "Strong progress. Prioritize solving inequalities with word prompts.",
      },
      {
        name: "Mixed Practice Set",
        score: 81,
        teacherNote: "Good effort. Continue targeted expression simplification practice.",
      },
    ],
  },
} as const
