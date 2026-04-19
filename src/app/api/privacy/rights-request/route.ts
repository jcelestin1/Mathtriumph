import { appendFile, mkdir } from "node:fs/promises"
import path from "node:path"

import { NextResponse } from "next/server"
import { z } from "zod"

import { getServerSession } from "@/lib/security/auth-server"

const RequestSchema = z.object({
  type: z.enum(["access", "amendment", "deletion"]),
  note: z.string().max(2000).optional(),
})

const DATA_DIR = path.join(process.cwd(), ".data")
const REQUEST_LOG = path.join(DATA_DIR, "privacy-rights-requests.log")

export async function POST(request: Request) {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const payload = RequestSchema.parse(await request.json())
    await mkdir(DATA_DIR, { recursive: true })
    await appendFile(
      REQUEST_LOG,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        userId: session.userId,
        role: session.role,
        requestType: payload.type,
        note: payload.note ?? "",
      }) + "\n",
      "utf8"
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ message: "Invalid request payload." }, { status: 400 })
  }
}
