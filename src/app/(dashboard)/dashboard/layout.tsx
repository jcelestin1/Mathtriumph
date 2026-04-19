import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import type { DemoRole } from "@/lib/demo-auth"
import { getServerSession } from "@/lib/security/auth-server"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }
  const initialRole: DemoRole = session.role

  return <DashboardShell initialRole={initialRole}>{children}</DashboardShell>
}
