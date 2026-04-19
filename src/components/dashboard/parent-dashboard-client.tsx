"use client"

import {
  CalendarClock,
  FileText,
  Flame,
  MessageSquare,
  Sparkles,
  UserRound,
} from "lucide-react"
import { useMemo, useState } from "react"

import { MasteryPieChart, ScoreTrendChart } from "@/components/charts"
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
  parentActivityFeed,
  parentChildDetails,
  parentChildren,
  parentRecommendations,
  parentTrendData,
} from "@/lib/dashboard-data"

type ChildKey = keyof typeof parentChildDetails

export function ParentDashboardClient() {
  const [selectedChild, setSelectedChild] = useState<ChildKey>("alex")
  const [openChildId, setOpenChildId] = useState<ChildKey | null>(null)

  const selectedData = parentChildDetails[selectedChild]

  const familyMastery = useMemo(() => {
    const total = parentChildren.reduce((sum, child) => sum + child.mastery, 0)
    return Math.round(total / parentChildren.length)
  }, [])

  const predictedExam = useMemo(() => {
    const total = parentChildren.reduce((sum, child) => sum + child.recentScore, 0)
    return Math.round(total / parentChildren.length) + 2
  }, [])

  const selectedChildCard = openChildId
    ? parentChildren.find((child) => child.id === openChildId)
    : null

  return (
    <section className="space-y-5">
      <header className="rounded-xl border border-border/70 bg-background/85 p-5">
        <p className="text-sm text-muted-foreground">Welcome back, Mrs. Rivera</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Family progress snapshot
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Two children actively learning • Total improvement this month: +14%.
          Great progress this week!
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {parentChildren.map((child) => (
          <Card key={child.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-4 text-teal-600" />
                {child.name}
              </CardTitle>
              <CardDescription>{child.grade}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-md border border-border/70 p-2">
                  <p className="text-muted-foreground">Mastery</p>
                  <p className="font-semibold">{child.mastery}%</p>
                </div>
                <div className="rounded-md border border-border/70 p-2">
                  <p className="text-muted-foreground">Recent</p>
                  <p className="font-semibold">{child.recentScore}%</p>
                </div>
                <div className="rounded-md border border-border/70 p-2">
                  <p className="text-muted-foreground">Streak</p>
                  <p className="font-semibold">{child.streak} days</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOpenChildId(child.id as ChildKey)}
              >
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Average Family Mastery</CardDescription>
            <CardTitle>{familyMastery}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={familyMastery} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Predicted Exam Score</CardDescription>
            <CardTitle>{predictedExam}%</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress value={predictedExam} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Monthly Growth Momentum</CardDescription>
            <CardTitle>+14%</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">
              <Flame className="mr-1 size-3.5" />
              Consistent weekly gains
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Combined family progress (actual vs predicted)</CardTitle>
        </CardHeader>
        <CardContent>
          <ScoreTrendChart title="Family trend" data={parentTrendData} xKey="day" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Family mastery distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <MasteryPieChart />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Individual child spotlight</CardTitle>
          <CardDescription>
            Select a child to view strengths, attention areas, and teacher notes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs
            defaultValue="alex"
            value={selectedChild}
            onValueChange={(value) => setSelectedChild(value as ChildKey)}
            className="space-y-4"
          >
            <TabsList>
              <TabsTrigger value="alex">Alex</TabsTrigger>
              <TabsTrigger value="sarah">Sarah</TabsTrigger>
            </TabsList>
            <TabsContent value={selectedChild} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Strong areas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedData.strong.map((item) => (
                      <div key={item.topic} className="space-y-1">
                        <p className="text-sm">{item.topic}</p>
                        <Progress value={item.mastery} />
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Needs attention</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedData.needsFocus.map((item) => (
                      <div key={item.topic} className="space-y-1">
                        <p className="text-sm">{item.topic}</p>
                        <Progress value={item.mastery} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent assessments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedData.assessments.map((assessment) => (
                    <div
                      key={assessment.name}
                      className="rounded-md border border-border/70 p-3"
                    >
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <p className="font-medium">{assessment.name}</p>
                        <Badge variant="secondary">{assessment.score}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Teacher note: {assessment.teacherNote}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activity feed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {parentActivityFeed.map((item) => (
              <p key={item} className="rounded-md border border-border/70 p-2 text-sm">
                {item}
              </p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations & insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {parentRecommendations.map((item) => (
              <p key={item} className="rounded-md border border-border/70 p-2 text-sm">
                {item}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>
            <CalendarClock className="mr-1 size-4" />
            Schedule Tutor Session
          </Button>
          <Button variant="outline">
            <MessageSquare className="mr-1 size-4" />
            Message Teacher
          </Button>
          <Button variant="outline">
            <FileText className="mr-1 size-4" />
            Generate Full Report
          </Button>
          <Button variant="secondary">
            <Sparkles className="mr-1 size-4" />
            View All Assessments
          </Button>
        </CardContent>
      </Card>

      <Dialog open={Boolean(openChildId)} onOpenChange={() => setOpenChildId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedChildCard?.name ?? "Child"} detailed view
            </DialogTitle>
            <DialogDescription>
              Supportive next steps and family-facing summary.
            </DialogDescription>
          </DialogHeader>
          {selectedChildCard ? (
            <div className="space-y-3 text-sm">
              <p>
                Current mastery: <strong>{selectedChildCard.mastery}%</strong>
              </p>
              <p>
                Recent assessment score: <strong>{selectedChildCard.recentScore}%</strong>
              </p>
              <p className="rounded-md border border-border/70 bg-muted/40 p-2">
                Positive insight: Consistency is driving gains. Keep this
                week&apos;s practice cadence and focus on one weak skill per day.
              </p>
              <Button className="w-full">Open Full Child Report</Button>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  )
}
