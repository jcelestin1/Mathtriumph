import { redirect } from "next/navigation"

import { getDashboardPathByRole } from "@/lib/demo-auth"
import { getServerSession } from "@/lib/security/auth-server"

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }

  redirect(getDashboardPathByRole(session.role))
}
