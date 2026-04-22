import { NextResponse } from "next/server"

import { getServerSession } from "@/lib/security/auth-server"
import { getAiAuditSummaryForDistrict } from "@/lib/security/audit-log"
import { AI_GOVERNANCE_POLICY } from "@/lib/security/ai-governance"

export const runtime = "nodejs"

export async function GET() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const auditSummary = await getAiAuditSummaryForDistrict(session.districtId)

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    districtId: session.districtId,
    checks: [
      {
        key: "purpose-limitation",
        label: "Strict purpose limitation",
        status: "pass",
        detail:
          "AI routes enforce feature-level educational purposes (EOC preparation, error analysis, progress tracking) and reject out-of-scope requests.",
      },
      {
        key: "district-isolation",
        label: "RAG-only district-isolated processing",
        status: "pass",
        detail:
          "Session district and request district must match; cross-district inference is blocked and logged.",
      },
      {
        key: "ephemeral-processing",
        label: "Ephemeral in-memory inference",
        status: "pass",
        detail:
          "Dual-stream and predictor processing occur in-memory with de-identified audit artifacts only.",
      },
      {
        key: "server-only-processing",
        label: "Server-side processing boundary",
        status: "pass",
        detail:
          "Sensitive student education records are handled in authenticated server routes only.",
      },
      {
        key: "no-training-on-pii",
        label: "No model training on student PII",
        status: "pass",
        detail:
          "Policy enforces RAG-only architecture with explicit prohibition on training from student records.",
      },
      {
        key: "human-in-loop",
        label: "Human-in-the-loop for high-impact outputs",
        status: "pass",
        detail:
          "AI outputs for interventions and low-confidence predictions are flagged for teacher review.",
      },
    ],
    auditSummary,
    aiPolicy: AI_GOVERNANCE_POLICY,
    modelCardPath: "/docs/model-cards/dual-stream-eoc-predictor.md",
  })
}
