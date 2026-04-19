# MathTriumph Model Card: Dual-Stream Error Analysis + EOC Predictor

## Intended Educational Purpose

- Florida B.E.S.T. Algebra 1 and Geometry EOC preparation.
- Formative diagnostic feedback, misconception tagging, and progress tracking.
- Teacher-facing intervention triage support.

## Out of Scope / Prohibited Uses

- Disciplinary or punitive actions without teacher review.
- Admissions, placement, or legal decisions.
- Training external models using student PII.

## System Design Summary

- Stream 1: neutral draft analyzer of student work.
- Stream 2: diagnostic analyzer aligned to benchmark context.
- Rule-based EOC predictor that weighs error type and recurrence.
- District-isolated, purpose-limited server-side inference.

## Data Handling

- Student education records processed server-side only.
- Inference requests are ephemeral in-memory operations.
- Audit events are stored as de-identified security/compliance logs.
- Encrypted-at-rest records store for persisted attempts.

## Human Oversight

- High-impact outputs are flagged as requiring teacher review.
- Intervention recommendations are advisory, not automatic decisions.

## Known Limitations

- Rule-based predictor is deterministic and not a psychometric substitute.
- Free-text student input can be noisy and incomplete.
- Misconception tags rely on benchmark metadata quality.

## Bias and Fairness Mitigation

- Use benchmark-aligned criteria instead of demographic factors.
- Require teacher verification for low-confidence/high-impact outputs.
- Periodically review false-positive/false-negative diagnostic patterns.

## Monitoring

- Audit logs track purpose, district, confidence band, and review requirement.
- FERPA compliance status surfaced in Manager Dashboard.
