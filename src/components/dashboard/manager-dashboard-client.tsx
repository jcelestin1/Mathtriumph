"use client"

import {
  Activity,
  BellRing,
  BarChart3,
  Download,
  FileText,
  Flame,
  School,
  Search,
  Send,
  Sparkles,
  UploadCloud,
  Users,
} from "lucide-react"
import { useMemo, useState } from "react"

import {
  MasteryPieChart,
  TopicMasteryChart,
  WeeklyActivityChart,
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
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  livePracticingStudents,
  managerAiInsights,
  managerKpis,
  managerStudents,
  recentManagerActivity,
  scoreTrendData,
} from "@/lib/dashboard-data"

export function ManagerDashboardClient() {
  const [selectedRole, setSelectedRole] = useState<"teacher" | "school_admin">(
    "teacher"
  )
  const [search, setSearch] = useState("")
  const [message, setMessage] = useState("")

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return managerStudents
    return managerStudents.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.className.toLowerCase().includes(query) ||
        student.weakTopic.toLowerCase().includes(query)
    )
  }, [search])

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Manager Navigation</CardTitle>
            <CardDescription>Teacher and school-level controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="space-y-1 text-sm">
              <span className="text-muted-foreground">Role switch</span>
              <select
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={selectedRole}
                onChange={(event) =>
                  setSelectedRole(event.target.value as "teacher" | "school_admin")
                }
              >
                <option value="teacher">Teacher</option>
                <option value="school_admin">School Admin</option>
              </select>
            </label>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="rounded-md border border-border/70 p-2">Overview</p>
              <p className="rounded-md border border-border/70 p-2">Students</p>
              <p className="rounded-md border border-border/70 p-2">Analytics</p>
              <p className="rounded-md border border-border/70 p-2">Reports</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trial Run Upload</CardTitle>
            <CardDescription>
              Free student trial-run upload before public launch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full bg-teal-600 text-white hover:bg-teal-700">
              <UploadCloud className="mr-1 size-4" />
              Upload Trial Student Data
            </Button>
            <p className="text-xs text-muted-foreground">
              Upload cohort performance to measure learning gains at no charge.
            </p>
          </CardContent>
        </Card>
      </aside>

      <section className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {managerKpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardHeader className="pb-2">
                <CardDescription>{kpi.label}</CardDescription>
                <CardTitle className="text-2xl">{kpi.value}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {kpi.trend}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Tabs defaultValue="classes" className="space-y-3">
              <TabsList>
                <TabsTrigger value="classes">My Classes</TabsTrigger>
                <TabsTrigger value="school">School Overview</TabsTrigger>
              </TabsList>
              <TabsContent value="classes">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="size-4 text-teal-600" />
                      Class-level performance pulse
                    </CardTitle>
                    <CardDescription>
                      Focus classes with high weak-topic overlap first.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="font-medium">Algebra I - A</p>
                      <p className="text-sm text-muted-foreground">
                        Avg 79% | 12 students on streak 5+ days
                      </p>
                    </div>
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="font-medium">Geometry - B</p>
                      <p className="text-sm text-muted-foreground">
                        Avg 73% | High intervention need: proof logic
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="school">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <School className="size-4 text-sky-600" />
                      School-wide readiness
                    </CardTitle>
                    <CardDescription>
                      {selectedRole === "school_admin"
                        ? "District-style metrics visible in school admin mode."
                        : "Switch to School Admin role for expanded district metrics."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3 md:grid-cols-3">
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="text-sm text-muted-foreground">Benchmarks on track</p>
                      <p className="text-2xl font-semibold">68%</p>
                    </div>
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="text-sm text-muted-foreground">Intervention programs</p>
                      <p className="text-2xl font-semibold">14 active</p>
                    </div>
                    <div className="rounded-lg border border-border/70 p-3">
                      <p className="text-sm text-muted-foreground">Badge earn rate</p>
                      <p className="text-2xl font-semibold">+22%</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="size-4 text-teal-600" />
                    Recent activity feed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {recentManagerActivity.map((item) => (
                    <p key={item} className="rounded-md border border-border/70 p-2 text-sm">
                      {item}
                    </p>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="size-4 text-amber-500" />
                    Students practicing now
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {livePracticingStudents.map((item) => (
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
                  <FileText className="mr-1 size-4" />
                  Assign Assessment
                </Button>
                <Button variant="outline">
                  <Sparkles className="mr-1 size-4" />
                  Generate Custom Quiz
                </Button>
                <Button variant="secondary">
                  <Send className="mr-1 size-4" />
                  Bulk Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Searchable student interventions</CardTitle>
                <CardDescription>
                  Identify weak areas and assign high-impact interventions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative max-w-sm">
                  <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Search by student, class, or weak topic..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Class</TableHead>
                      <TableHead>Avg Score</TableHead>
                      <TableHead>Weak Topic</TableHead>
                      <TableHead>Intervention Suggestion</TableHead>
                      <TableHead>Gamification</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.className}</TableCell>
                        <TableCell>{student.avgScore}%</TableCell>
                        <TableCell>{student.weakTopic}</TableCell>
                        <TableCell className="max-w-[300px] whitespace-normal">
                          {student.intervention}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                              <Flame className="mr-1 size-3" />
                              {student.streak}
                            </Badge>
                            <Badge>{student.badges} badges</Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Topic mastery across classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <TopicMasteryChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Overall mastery distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <MasteryPieChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weekly learning activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <WeeklyActivityChart />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Score trend reference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {scoreTrendData.map((point) => (
                    <div
                      key={point.week}
                      className="flex items-center justify-between rounded-md border border-border/70 p-2 text-sm"
                    >
                      <p>{point.week}</p>
                      <p className="text-muted-foreground">
                        Actual {point.actualScore}% / Predicted {point.predictedScore}%
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Reports and benchmark comparison</CardTitle>
                <CardDescription>
                  Export-ready reporting for trial runs and full launch.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setMessage("CSV export queued (mock).")}
                  >
                    <Download className="mr-1 size-4" />
                    Export CSV
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMessage("PDF report generation queued (mock).")}
                  >
                    <Download className="mr-1 size-4" />
                    Export PDF
                  </Button>
                  <Button
                    onClick={() =>
                      setMessage("Benchmark comparison report created (mock).")
                    }
                  >
                    <BarChart3 className="mr-1 size-4" />
                    Compare Benchmarks
                  </Button>
                </div>
                {message ? (
                  <p className="rounded-md border border-border/70 bg-muted/40 p-2 text-sm text-muted-foreground">
                    {message}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI-suggested insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {managerAiInsights.map((insight) => (
                  <p key={insight} className="rounded-md border border-border/70 p-2 text-sm">
                    {insight}
                  </p>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  )
}
