"use client"

import {
  Award,
  BrainCircuit,
  Clock3,
  Flame,
  MessageCircle,
  Rocket,
  Target,
} from "lucide-react"
import { useMemo, useState } from "react"

import {
  ProgressComposedChart,
  ScoreTrendChart,
  SkillRadarChart,
} from "@/components/charts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  leaderboard,
  studentAssessments,
  studentBadges,
  studentHeader,
  studentOverviewCards,
  studentScoreTrend,
  studentSkills,
} from "@/lib/dashboard-data"

type SkillStrength = "all" | "weak" | "strong"
type Skill = (typeof studentSkills)[number]

export function StudentDashboardClient() {
  const [selectedTab, setSelectedTab] = useState<SkillStrength>("all")
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)

  const filteredSkills = useMemo(() => {
    if (selectedTab === "all") return studentSkills
    return studentSkills.filter((skill) => skill.strength === selectedTab)
  }, [selectedTab])

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
      <section className="space-y-5">
        <header className="rounded-xl border border-border/70 bg-background/85 p-5">
          <p className="text-sm text-muted-foreground">{studentHeader.greeting}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            Your Triumph dashboard
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge>
              <Flame className="mr-1 size-3.5" />
              {studentHeader.streak}-day streak
            </Badge>
            <Badge variant="secondary">
              <Rocket className="mr-1 size-3.5" />
              {studentHeader.weeklyXp} XP this week
            </Badge>
            <Badge variant="outline">{studentHeader.mastery}% mastery</Badge>
          </div>
          <p className="mt-3 text-sm text-teal-700 dark:text-teal-300">
            You&apos;re {studentHeader.mastery}% there - one more quiz to hit 90%!
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {studentOverviewCards.map((card) => (
            <Card key={card.label}>
              <CardHeader>
                <CardDescription>{card.label}</CardDescription>
                <CardTitle className="text-2xl">
                  {card.label.includes("Score") ? card.value : `${card.value}%`}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={Number(card.value)} />
                <p className="text-xs text-muted-foreground">{card.helper}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Skill breakdown</CardTitle>
            <CardDescription>
              Focus weak areas first, then lock in strengths.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="all"
              value={selectedTab}
              onValueChange={(value) => setSelectedTab(value as SkillStrength)}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="all">All Topics</TabsTrigger>
                <TabsTrigger value="weak">Weak Areas</TabsTrigger>
                <TabsTrigger value="strong">Strong Areas</TabsTrigger>
              </TabsList>
              <TabsContent value={selectedTab}>
                <div className="grid gap-3 md:grid-cols-2">
                  {filteredSkills.map((skill) => (
                    <Card key={skill.id}>
                      <CardHeader>
                        <CardTitle className="text-base">{skill.topic}</CardTitle>
                        <CardDescription>{skill.mastery}% mastery</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Progress value={skill.mastery} />
                        <div className="flex gap-2">
                          <Button size="sm">Practice Now</Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedSkill(skill)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recommended practice</CardTitle>
              <CardDescription>
                Algebra assessment (15 min) • Estimated gain +12 points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-border/70 bg-muted/40 p-3">
                Difficulty: Medium-Hard • Best time: 5:30 PM
              </div>
              <div className="flex flex-wrap gap-2">
                <Button>
                  <Target className="mr-1 size-4" />
                  Start Recommended Quiz
                </Button>
                <Button variant="outline">
                  <Clock3 className="mr-1 size-4" />
                  Timed Test
                </Button>
                <Button variant="secondary">
                  <BrainCircuit className="mr-1 size-4" />
                  Concept Drill
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription>Last 5 assessments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {studentAssessments.map((assessment) => (
                <div
                  key={assessment.name}
                  className="flex items-center justify-between rounded-md border border-border/70 p-2 text-sm"
                >
                  <div>
                    <p className="font-medium">{assessment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {assessment.topics} • {assessment.duration}
                    </p>
                  </div>
                  <Badge variant="secondary">{assessment.score}%</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Skill radar snapshot</CardTitle>
          </CardHeader>
          <CardContent>
            <SkillRadarChart className="h-[360px]" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Score trend (actual vs predicted)</CardTitle>
          </CardHeader>
          <CardContent>
            <ScoreTrendChart title="Last 10 assessments" data={studentScoreTrend} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly progress vs goal</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressComposedChart />
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>Light gamification, real motivation.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {studentBadges.map((badge) => (
                <Badge key={badge}>
                  <Award className="mr-1 size-3.5" />
                  {badge}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leaderboard snippet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className="flex items-center justify-between rounded-md border border-border/70 p-2 text-sm"
                >
                  <p>
                    #{entry.rank} {entry.name}
                  </p>
                  <p className="font-medium">{entry.points} XP</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Button className="w-full justify-start">Take Timed Test</Button>
            <Button variant="outline" className="w-full justify-start">
              View Study Plan
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <MessageCircle className="mr-1 size-4" />
              Message Tutor
            </Button>
            <Button variant="secondary" className="w-full justify-start">
              Browse All Topics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Motivation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p className="rounded-md border border-border/70 p-2">
              Keep your streak alive today for +120 bonus XP.
            </p>
            <p className="rounded-md border border-border/70 p-2">
              Top 3 in class earns the weekly Triumph trophy.
            </p>
            <p className="rounded-md border border-border/70 p-2">
              Finish 2 weak-topic drills to unlock a new badge.
            </p>
          </CardContent>
        </Card>
      </aside>

      <Dialog open={Boolean(selectedSkill)} onOpenChange={() => setSelectedSkill(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedSkill?.topic ?? "Skill details"}
            </DialogTitle>
            <DialogDescription>
              Detailed skill modal preview for targeted intervention and prep.
            </DialogDescription>
          </DialogHeader>
          {selectedSkill ? (
            <div className="space-y-3 text-sm">
              <p>
                Current mastery: <strong>{selectedSkill.mastery}%</strong>
              </p>
              <p>
                Recommended plan: complete 2 targeted problem sets and 1 timed
                review session this week.
              </p>
              <p className="rounded-md border border-border/70 bg-muted/40 p-2">
                Expected outcome: +6% to +10% mastery gain in 7 days with
                consistent practice.
              </p>
              <div className="flex gap-2">
                <Button>Start Focus Drill</Button>
                <Button variant="outline">Add to Study Plan</Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
