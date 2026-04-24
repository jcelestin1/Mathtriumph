export const CREDIT_RECOVERY_CATALOG_DISTRICT_ID = "catalog"

export const creditRecoveryCatalog = [
  {
    slug: "algebra-1-credit-recovery",
    title: "Algebra 1 Credit Recovery",
    description:
      "Florida-aligned Algebra 1 credit recovery with mastery-based pacing, benchmark remediation, and EOC readiness checkpoints.",
    subjectArea: "mathematics",
    floridaCourseCode: "1200315",
    recoveryType: "course_recovery",
    eocCourse: "Algebra 1",
    gradeBandStart: 8,
    gradeBandEnd: 12,
    transcriptEligible: true,
    masteryModel: "standards_mastery",
    supportModel: {
      staffingModels: [
        "teacher_supported_self_paced",
        "intervention_lab",
        "summer_recovery",
      ],
      studentSupports: [
        "diagnostic_placement",
        "multilingual_scaffolds",
        "family_progress_updates",
        "eoc_readiness_checks",
      ],
    },
    policyConfig: {
      floridaAlignment: {
        exactCourseMatchRequired: true,
        masteryInsteadOfSeatTime: true,
        gradeForgivenessEligible: true,
        transcriptFlags: ["X", "I"],
        eocRequired: true,
      },
      phase: "phase_1",
    },
    modules: [
      {
        slug: "expressions-equations-foundations",
        title: "Expressions, Equations, and Foundations",
        description:
          "Repairs linear equation fluency, inverse operations, and procedural accuracy needed for successful recovery.",
        sequence: 1,
        benchmarkCode: "MA.912.AR.2.1",
        reportingCategory: "Algebra and Modeling",
        prerequisiteSkills: [
          "integer_operations",
          "one_step_equations",
          "variable_isolation",
        ],
        masteryThreshold: 80,
        estimatedMinutes: 120,
        supports: {
          misconceptions: [
            "linear-equation-inverse-operations",
            "formula-substitution",
          ],
          interventionMoves: ["worked_examples", "error_analysis", "small_group_reteach"],
        },
      },
      {
        slug: "functions-representations",
        title: "Functions and Representations",
        description:
          "Connects tables, graphs, equations, and verbal descriptions so students can reason across representations.",
        sequence: 2,
        benchmarkCode: "MA.912.AR.1.5",
        reportingCategory: "Algebra and Modeling",
        prerequisiteSkills: [
          "coordinate_plane",
          "rate_of_change",
          "function_notation",
        ],
        masteryThreshold: 80,
        estimatedMinutes: 135,
        supports: {
          misconceptions: [
            "function-representation-linking",
            "slope-and-rate-of-change",
          ],
          interventionMoves: ["graphing_scaffolds", "guided_practice", "quick_checks"],
        },
      },
      {
        slug: "systems-modeling",
        title: "Systems and Mathematical Modeling",
        description:
          "Builds confidence solving systems and modeling multi-step contextual problems with appropriate strategies.",
        sequence: 3,
        benchmarkCode: "MA.912.AR.3.1",
        reportingCategory: "Algebra and Functions",
        prerequisiteSkills: [
          "linear_equations",
          "graph_interpretation",
          "substitution_strategy",
        ],
        masteryThreshold: 82,
        estimatedMinutes: 135,
        supports: {
          misconceptions: [
            "multi-step-word-problem-modeling",
            "slope-and-rate-of-change",
          ],
          interventionMoves: ["strategy_sort", "teacher_conference", "real_world_tasks"],
        },
      },
      {
        slug: "quadratics-eoc-readiness",
        title: "Quadratics and EOC Readiness",
        description:
          "Targets factoring, structure, and benchmark-aligned readiness checks needed before EOC retake approval.",
        sequence: 4,
        benchmarkCode: "MA.912.AR.3.2",
        reportingCategory: "Algebra and Functions",
        prerequisiteSkills: [
          "polynomial_operations",
          "factoring_fluency",
          "equation_reasoning",
        ],
        masteryThreshold: 85,
        estimatedMinutes: 150,
        supports: {
          misconceptions: ["factoring-quadratics", "formula-substitution"],
          interventionMoves: ["reteach_playlist", "benchmark_quiz", "oral_defense"],
        },
      },
    ],
  },
  {
    slug: "geometry-credit-recovery",
    title: "Geometry Credit Recovery",
    description:
      "Florida-aligned Geometry credit recovery with benchmark mastery, proof support, and EOC-focused remediation.",
    subjectArea: "mathematics",
    floridaCourseCode: "1206315",
    recoveryType: "course_recovery",
    eocCourse: "Geometry",
    gradeBandStart: 8,
    gradeBandEnd: 12,
    transcriptEligible: true,
    masteryModel: "standards_mastery",
    supportModel: {
      staffingModels: [
        "teacher_supported_self_paced",
        "intervention_lab",
        "after_school_recovery",
      ],
      studentSupports: [
        "visual_models",
        "proof_scaffolds",
        "multilingual_scaffolds",
        "eoc_readiness_checks",
      ],
    },
    policyConfig: {
      floridaAlignment: {
        exactCourseMatchRequired: true,
        masteryInsteadOfSeatTime: true,
        gradeForgivenessEligible: true,
        transcriptFlags: ["X", "I"],
        eocRequired: true,
      },
      phase: "phase_1",
    },
    modules: [
      {
        slug: "transformations-congruence",
        title: "Transformations and Congruence",
        description:
          "Rebuilds rigid transformations, congruence reasoning, and visual proof foundations for recovery success.",
        sequence: 1,
        benchmarkCode: "MA.912.GR.1.1",
        reportingCategory: "Geometry, Congruence, and Proof",
        prerequisiteSkills: [
          "coordinate_plane",
          "angle_vocabulary",
          "shape_properties",
        ],
        masteryThreshold: 80,
        estimatedMinutes: 120,
        supports: {
          misconceptions: [
            "triangle-congruence-similarity",
            "proof-structure-logic-gap",
          ],
          interventionMoves: ["manipulatives", "annotated_examples", "teacher_checkin"],
        },
      },
      {
        slug: "parallel-lines-angle-relationships",
        title: "Parallel Lines and Angle Relationships",
        description:
          "Strengthens angle-pair reasoning and equation setup for transversals and geometric relationships.",
        sequence: 2,
        benchmarkCode: "MA.912.GR.2.1",
        reportingCategory: "Congruence, Similarity, Right Triangles, and Trigonometry",
        prerequisiteSkills: [
          "supplementary_angles",
          "solving_one_variable_equations",
          "vocabulary_precision",
        ],
        masteryThreshold: 82,
        estimatedMinutes: 130,
        supports: {
          misconceptions: [
            "angle-pair-name-confusion",
            "parallel-lines-angle-relationships",
          ],
          interventionMoves: ["vocabulary_cards", "guided_practice", "benchmark_check"],
        },
      },
      {
        slug: "measurement-area-modeling",
        title: "Measurement, Area, and Modeling",
        description:
          "Targets perimeter, area, and geometric modeling decisions with formula selection support.",
        sequence: 3,
        benchmarkCode: "MA.912.GR.3.1",
        reportingCategory: "Geometric Measurement and Data",
        prerequisiteSkills: [
          "rectangle_area",
          "triangle_area",
          "unit_conversion",
        ],
        masteryThreshold: 80,
        estimatedMinutes: 135,
        supports: {
          misconceptions: [
            "area-and-perimeter-selection",
            "formula-substitution",
          ],
          interventionMoves: ["formula_sort", "visual_models", "mini_assessment"],
        },
      },
      {
        slug: "right-triangles-slope-eoc-readiness",
        title: "Right Triangles, Slope, and EOC Readiness",
        description:
          "Combines slope relationships, right-triangle reasoning, and final benchmark review before teacher sign-off.",
        sequence: 4,
        benchmarkCode: "MA.912.GR.2.4",
        reportingCategory: "Congruence, Similarity, Right Triangles, and Trigonometry",
        prerequisiteSkills: [
          "slope_interpretation",
          "distance_reasoning",
          "pythagorean_theorem",
        ],
        masteryThreshold: 85,
        estimatedMinutes: 150,
        supports: {
          misconceptions: [
            "slope-vs-perpendicularity-confusion",
            "triangle-angle-sum",
          ],
          interventionMoves: ["benchmark_quiz", "oral_defense", "teacher_review"],
        },
      },
    ],
  },
]

export async function seedCreditRecoveryCatalog(prisma) {
  for (const program of creditRecoveryCatalog) {
    await prisma.creditRecoveryProgram.upsert({
      where: {
        districtId_slug: {
          districtId: CREDIT_RECOVERY_CATALOG_DISTRICT_ID,
          slug: program.slug,
        },
      },
      update: {
        title: program.title,
        description: program.description,
        subjectArea: program.subjectArea,
        floridaCourseCode: program.floridaCourseCode,
        recoveryType: program.recoveryType,
        eocCourse: program.eocCourse,
        gradeBandStart: program.gradeBandStart,
        gradeBandEnd: program.gradeBandEnd,
        standardsFramework: "Florida B.E.S.T.",
        transcriptEligible: program.transcriptEligible,
        masteryModel: program.masteryModel,
        supportModel: program.supportModel,
        policyConfig: program.policyConfig,
      },
      create: {
        districtId: CREDIT_RECOVERY_CATALOG_DISTRICT_ID,
        slug: program.slug,
        title: program.title,
        description: program.description,
        subjectArea: program.subjectArea,
        floridaCourseCode: program.floridaCourseCode,
        recoveryType: program.recoveryType,
        eocCourse: program.eocCourse,
        gradeBandStart: program.gradeBandStart,
        gradeBandEnd: program.gradeBandEnd,
        standardsFramework: "Florida B.E.S.T.",
        transcriptEligible: program.transcriptEligible,
        masteryModel: program.masteryModel,
        supportModel: program.supportModel,
        policyConfig: program.policyConfig,
      },
    })

    const persistedProgram = await prisma.creditRecoveryProgram.findUnique({
      where: {
        districtId_slug: {
          districtId: CREDIT_RECOVERY_CATALOG_DISTRICT_ID,
          slug: program.slug,
        },
      },
      select: { id: true },
    })

    if (!persistedProgram) continue

    for (const module of program.modules) {
      await prisma.creditRecoveryModule.upsert({
        where: {
          programId_slug: {
            programId: persistedProgram.id,
            slug: module.slug,
          },
        },
        update: {
          title: module.title,
          description: module.description,
          sequence: module.sequence,
          benchmarkCode: module.benchmarkCode,
          reportingCategory: module.reportingCategory,
          prerequisiteSkills: module.prerequisiteSkills,
          masteryThreshold: module.masteryThreshold,
          estimatedMinutes: module.estimatedMinutes,
          supports: module.supports,
        },
        create: {
          programId: persistedProgram.id,
          slug: module.slug,
          title: module.title,
          description: module.description,
          sequence: module.sequence,
          benchmarkCode: module.benchmarkCode,
          reportingCategory: module.reportingCategory,
          prerequisiteSkills: module.prerequisiteSkills,
          masteryThreshold: module.masteryThreshold,
          estimatedMinutes: module.estimatedMinutes,
          supports: module.supports,
        },
      })
    }
  }
}
