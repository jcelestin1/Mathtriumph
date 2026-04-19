export type AiCoachModel = "claude-4" | "gpt-5.1"

export const AI_COACH_MODELS: AiCoachModel[] = ["claude-4", "gpt-5.1"]

export function getCoachModelLabel(model: AiCoachModel) {
  return model === "claude-4" ? "Claude 4" : "GPT-5.1"
}
