# MATHTRIUMPH Credit Recovery PRD

## Summary

MATHTRIUMPH Credit Recovery extends the existing MathTriumph API platform with a Florida-aligned credit recovery domain for middle school through high school mathematics. Phase 1 focuses on Algebra 1 and Geometry recovery, with a backend-first implementation that supports catalog publication, student enrollment assignment, benchmark/module progress tracking, EOC readiness signaling, and Florida-style grade-forgiveness metadata.

This PRD combines product requirements, data model decisions, and the initial API implementation contract so the first build slice can be coded immediately.

## Problem

Districts need a math recovery system that is more rigorous, transparent, and support-rich than a generic online course retake. Existing products often optimize for seat-time completion instead of true standards recovery, weakly connect recovery work to counselor workflows, and fail to expose clear mastery evidence for Algebra 1 and Geometry.

Florida DOE guidance provides a strong baseline:

- Recovery courses must match the originally attempted course content.
- Recovery can be mastery-based rather than seat-time bound.
- Grade forgiveness and transcript rules must remain auditable.
- Algebra 1 and Geometry recovery must still respect EOC requirements.
- Approved-provider/course-catalog patterns should expose quality and performance clearly.

## Goals

- Add a production-grade credit recovery domain to the MathTriumph API.
- Launch Phase 1 Algebra 1 and Geometry recovery.
- Preserve Florida-aligned policy concepts while making the system extensible nationwide.
- Support teacher, interventionist, counselor, and admin workflows through authenticated APIs.
- Use relational persistence for queryable recovery programs, enrollments, and progress.

## Non-goals for Phase 1

- Full student-facing recovery UI.
- Parent-facing recovery dashboards.
- Automated transcript export to SIS.
- Algebra 2 implementation.
- Full nationwide multi-state policy pack implementation.

## Users

- District Admin
- School Admin
- Interventionist
- Instructional Coach
- Teacher
- Data Analyst
- Student (read-only access later; limited in Phase 1)

## Phase 1 Scope

### In scope

- Algebra 1 credit recovery catalog program.
- Geometry credit recovery catalog program.
- Benchmark-aligned module definitions for both programs.
- Recovery enrollment assignment API.
- Enrollment listing API with program/module progress.
- Module progress update API.
- Recovery summary metrics in the API response layer.
- Seeded catalog data for local/dev environments.
- In-repo PRD and schema-backed implementation contract.

### Out of scope

- Full remediation content authoring engine.
- Assessment item authoring UI.
- Automated counselor recommendation engine.
- Final teacher approval / transcript export workflow UI.

## Product principles

1. Recovery must be standards-identical, not watered down.
2. Progress must be mastery-based, not merely time-based.
3. Every enrollment must stay auditable.
4. Teachers and interventionists need actionable module-level insight.
5. The model must support middle-school-to-high-school math continuity.
6. Catalog, progress, and compliance language should be understandable by districts.

## Florida-aligned requirements

- Program metadata must store the Florida course code when applicable.
- Recovery programs must mark whether they are transcript eligible.
- Programs must indicate whether EOC requirements still apply.
- Enrollments must support grade-forgiveness / transcript replacement metadata.
- Program policy config must preserve transcript flag semantics such as `X` and `I`.
- Module-level progression must support benchmark-aligned recovery evidence and teacher review.

## User stories

### Teacher / interventionist

- As a teacher, I can list available Algebra 1 and Geometry recovery programs.
- As a teacher, I can assign a student to a recovery enrollment with a reason and target completion date.
- As a teacher, I can update benchmark/module mastery and attach evidence notes.
- As an interventionist, I can see which students are stalled, ready for review, or nearing completion.

### District / school admin

- As an admin, I can review which recovery programs are in the catalog.
- As an admin, I can review enrollment progress by status and mastery percentage.
- As an admin, I can trust that policy metadata is stored for later transcript and compliance workflows.

### Student

- As a student, my recovery path will eventually reflect exactly which modules remain and how close I am to completion.

## Functional requirements

### Catalog

- The system must expose a seeded catalog of credit recovery programs.
- Each program must include:
  - slug
  - title
  - description
  - subject area
  - Florida course code
  - recovery type
  - EOC course
  - grade band
  - standards framework
  - transcript eligibility
  - mastery model
  - support model JSON
  - policy config JSON
- Each program must include ordered modules with:
  - sequence
  - benchmark code
  - reporting category
  - prerequisite skills
  - mastery threshold
  - estimated minutes
  - supports metadata

### Enrollment assignment

- Authorized staff can create an enrollment for a student.
- An enrollment must store:
  - district
  - student
  - assigner
  - selected program
  - reason
  - original course metadata
  - transcript replacement eligibility
  - EOC requirement
  - notes
  - target completion date
- Module progress rows must be created automatically for the selected program.

### Progress tracking

- Authorized staff can update module progress.
- Progress rows must support:
  - status
  - diagnostic score
  - mastery score
  - benchmark readiness
  - mastered timestamp
  - last worked timestamp
  - evidence JSON
  - teacher notes
- Enrollment summary metrics must be recalculated after updates:
  - module count
  - mastered module count
  - readiness count
  - mastery percent
  - status transitions

### Enrollment retrieval

- Authorized staff can list district enrollments with optional filters:
  - status
  - student user id
  - program slug
- Student users can view only their own enrollments.
- Responses must include program/module context and aggregate progress.

## Permissions

Phase 1 uses existing role/path access conventions rather than introducing a new permission string. The following roles can manage recovery through the API:

- district_admin
- school_admin
- teacher
- interventionist
- instructional_coach

Students may read only their own enrollments.

## Data model

### New enums

- `CreditRecoveryProgramType`
- `CreditRecoveryEnrollmentStatus`
- `CreditRecoveryReason`
- `CreditRecoveryProgressStatus`

### New tables

- `CreditRecoveryProgram`
- `CreditRecoveryModule`
- `CreditRecoveryEnrollment`
- `CreditRecoveryEnrollmentProgress`

### Design rationale

- Queryable recovery data belongs in Prisma/Postgres, not the encrypted file-backed attempt store.
- Attempts remain useful for quiz analytics, but recovery programs/enrollments require joins, filtering, aggregation, and durable administrative workflows.
- Catalog programs use `districtId = "catalog"` so they can be shared across districts while still fitting the current data model.

## API design

### `GET /api/credit-recovery/programs`

Returns catalog programs, with optional filtering by `recoveryType`.

### `GET /api/credit-recovery/enrollments`

Returns enrollments scoped by current user permissions with optional filters:

- `status`
- `studentUserId`
- `programSlug`

### `POST /api/credit-recovery/enrollments`

Creates a new recovery enrollment and auto-generates module progress rows.

### `PATCH /api/credit-recovery/enrollments/[enrollmentId]`

Updates one module progress record and recalculates enrollment-level summary fields.

## Initial catalog

Phase 1 seeded programs:

- `algebra-1-credit-recovery`
- `geometry-credit-recovery`

Each program contains four benchmark-aligned modules tuned for recovery and EOC readiness.

## Risks

- Existing role permission strings do not yet include a dedicated credit recovery permission.
- The UI is not yet implemented, so API-only validation is required first.
- Current session model assumes a logged-in seeded user and no separate counselor persona.
- Program catalog data is seeded locally and not yet editable via admin UI.

## Future phases

### Phase 2

- Algebra 2 recovery
- Foundational skills in mathematics 9-12
- Student dashboard pages for recovery
- Counselor-specific transcript workflow APIs
- Recovery analytics dashboard tiles

### Phase 3

- Parent visibility
- Multi-state policy packs
- SIS transcript integration
- Approval workflows for completion sign-off

## Implementation order

1. Prisma schema and migration
2. Seeded recovery catalog
3. Server-side recovery library
4. Route handlers for programs, enrollments, and progress
5. Focused tests and API verification
6. UI integration
