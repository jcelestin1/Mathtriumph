import { redirect } from "next/navigation"

import { getServerSession } from "@/lib/security/auth-server"

export default async function DashboardRouteGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession()
  if (!session) {
    redirect("/login")
  }
  return <>{children}</>
}
