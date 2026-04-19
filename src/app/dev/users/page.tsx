import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { getServerSession } from "@/lib/security/auth-server"
import { prisma } from "@/lib/server/prisma"

export const metadata: Metadata = {
  title: "Dev Users",
  description: "Development-only view of seeded users.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function DevUsersPage() {
  const session = await getServerSession()
  if (!session) {
    redirect("/login?from=/dev/users")
  }

  if (!(session.role === "district_admin" || session.role === "school_admin")) {
    redirect("/dashboard")
  }

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      districtId: true,
      createdAt: true,
    },
  })

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Development Users
        </h1>
        <p className="text-sm text-muted-foreground">
          Admin-only local page to inspect currently seeded users.
        </p>
      </section>

      <section className="mt-6 overflow-hidden rounded-lg border border-border/70">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-3 py-2 font-medium">Full name</th>
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">District</th>
              <th className="px-3 py-2 font-medium">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-border/60">
                <td className="px-3 py-2">{user.fullName}</td>
                <td className="px-3 py-2">{user.email}</td>
                <td className="px-3 py-2 capitalize">
                  {user.role.replace("_", " ")}
                </td>
                <td className="px-3 py-2">{user.districtId}</td>
                <td className="px-3 py-2">
                  {new Intl.DateTimeFormat("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(user.createdAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
