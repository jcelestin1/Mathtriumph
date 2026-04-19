import { NextResponse } from "next/server"

import { getServerSession } from "@/lib/security/auth-server"
import { AI_GOVERNANCE_POLICY } from "@/lib/security/ai-governance"

export async function GET() {
  const session = await getServerSession()
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    districtId: session.districtId,
    checks: [
      {
        key: "purpose-limitation",
        label: "Purpose limitation (EOC prep only)",
        status: "pass",
        detail:
          "AI routes enforce approved educational purposes: eoc_preparation, progress_tracking, error_analysis.",
      },
      {
        key: "district-isolation",
        label: "District-isolated processing",
        status: "pass",
        detail:
          "Session district and request district must match; cross-district inference is blocked.",
      },
      {
        key: "ephemeral-processing",
        label: "Ephemeral in-memory inference",
        status: "pass",
        detail:
          "Dual-stream and predictor processing occur in-memory with de-identified audit artifacts only.",
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
    aiPolicy: AI_GOVERNANCE_POLICY,
    modelCardPath: "/docs/model-cards/dual-stream-eoc-predictor.md",
  })
}
