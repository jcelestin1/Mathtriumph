import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Brain,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  LayoutGrid,
  Lightbulb,
  Scale,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export const metadata: Metadata = {
  title: "Top 10 Credit Recovery Programs | U.S. High Schools | MathTriumph",
  description:
    "An in-depth comparison of the 10 most widely used credit recovery programs across U.S. public high school districts — plus a design prompt for building the ideal national program.",
}

const programs = [
  {
    rank: 1,
    name: "Imagine Edgenuity",
    vendor: "Imagine Learning",
    color: "bg-blue-600",
    badgeColor: "bg-blue-100 text-blue-800",
    stateSources: ["Virginia (NNPS)", "New Mexico (Los Lunas)", "California", "Texas TEA"],
    adoptionNote: "Most cited platform by district administrators nationwide (AIR 2024, 86% use external online company).",
    deliveryModel: "Asynchronous, self-paced; video-based direct instruction from on-screen teachers.",
    courseCount: "400+ courses for grades 6–12",
    crSpecificFeature: "Dedicated CR versions (~under 80 hours) with diagnostic pretesting to skip mastered content.",
    adaptiveLearning: "Pretesting bypasses mastered units; EdgeEX platform generates personalized study plans.",
    teacherSupport: "On-demand tutoring (7 AM–11 PM), AI Grading Assistant, Educator Launchpad, certified virtual teachers available.",
    integrityTools: "Plagiarism Checker, Speed Radar, Proctorio Lockdown Browser.",
    accessibility: "Language translation, read-aloud, closed captions; WCAG compliant.",
    reportingDashboard: "Teacher Actions Report, Attendance Report, Gradebook Activities Report.",
    ncaaApproval: "Initial Credit versions are NCAA-eligible; CR versions are not.",
    implementationModel: "Computer lab with staff support (most common), classroom with certified teacher, or independent.",
    strengths: ["Richest video instruction library", "Most robust integrity tools", "Widest district adoption"],
    limitations: ["CR versions not NCAA-eligible", "Can feel lecture-heavy without facilitation"],
  },
  {
    rank: 2,
    name: "Apex Learning / Apex Courses",
    vendor: "Edmentum",
    color: "bg-purple-600",
    badgeColor: "bg-purple-100 text-purple-800",
    stateSources: ["North Carolina DPI", "Colorado CDE", "Washington OSPI", "Texas TEA virtual catalog"],
    adoptionNote: "Long-standing provider; merged into Edmentum Courseware platform; widely cited by APs nationwide.",
    deliveryModel: "Text-rich, structured digital lessons with interactive activities; available asynchronous or with live teacher.",
    courseCount: "500+ courses (combined Edmentum catalog)",
    crSpecificFeature: "Prescriptive pretests auto-generate an Individualized Learning Plan (ILP) focused only on unmastered content.",
    adaptiveLearning: "ILP directs each student to only the specific modules/activities they need.",
    teacherSupport: "1-on-1 certified teacher support, progress monitoring, detailed feedback cycles.",
    integrityTools: "On-site proctoring recommended; platform activity monitoring.",
    accessibility: "Screen-reader compatible; captioned videos.",
    reportingDashboard: "District-level and school-level progress dashboards; real-time alerts.",
    ncaaApproval: "Comprehensive (full-length) courses are NCAA-eligible; prescriptive CR versions are not.",
    implementationModel: "Designed to complete a 1-credit course in 10 weeks or less; flexible scheduling.",
    strengths: ["Strong ILP personalization", "Proven outcomes data", "Deep Edmentum ecosystem (Exact Path, EdOptions)"],
    limitations: ["Prescriptive CR tracks not NCAA-eligible", "Text-heavy interface rated less engaging by students"],
  },
  {
    rank: 3,
    name: "Imagine Odysseyware (CRx)",
    vendor: "Imagine Learning",
    color: "bg-teal-600",
    badgeColor: "bg-teal-100 text-teal-800",
    stateSources: ["Arizona ADE", "Rural Virtual Academy Consortium (multi-state)", "Arkansas DOE", "Idaho SDE"],
    adoptionNote: "Preferred in rural and small districts; strong presence in Midwest and Mountain West.",
    deliveryModel: "Self-paced, mastery-based online courses; text and media hybrid.",
    courseCount: "300+ standards-aligned courses for grades 3–12",
    crSpecificFeature: "CRx Mode: unit pre-test 'test-out' model. Pass threshold = skip unit; partial mastery = only assigned needed lessons.",
    adaptiveLearning: "Pre-test results automatically assign or skip specific lessons within each unit.",
    teacherSupport: "Teacher-assigned paths, automatic grading, built-in messaging.",
    integrityTools: "Proctored assessment options; activity tracking.",
    accessibility: "Text-to-speech, translation into 23 languages, any-device access.",
    reportingDashboard: "Detailed activity logs, mastery reports, standards-tracking.",
    ncaaApproval: "Not widely listed as NCAA-approved.",
    implementationModel: "Often used in blended lab setting; strong in hybrid dropout recovery programs.",
    strengths: ["Best language accessibility (23 languages)", "Granular unit-level mastery skipping", "Strong rural district fit"],
    limitations: ["Less video-driven than Edgenuity", "Less known outside rural/Midwest markets"],
  },
  {
    rank: 4,
    name: "K12 Rebound / Rapid Credit Recovery",
    vendor: "Stride, Inc. (K12)",
    color: "bg-orange-600",
    badgeColor: "bg-orange-100 text-orange-800",
    stateSources: ["Texas TEA", "Ohio DOE", "Colorado CDE Dropout Recovery", "California CDE"],
    adoptionNote: "Widely used in dropout recovery and re-engagement programs; strong in states with K12 virtual academies.",
    deliveryModel: "Fully online or blended; diagnostic-driven, adaptive release courses.",
    courseCount: "Core and elective catalog across grades 6–12",
    crSpecificFeature: "Rapid Credit Recovery: adaptive diagnostics place students at the right level; students test out of mastered content. Credit by Exam option also available.",
    adaptiveLearning: "Automatic diagnostic placement determines entry point within course.",
    teacherSupport: "24/7 phone, chat, and video support from certified teachers.",
    integrityTools: "On-site proctoring for exams; activity monitoring.",
    accessibility: "Multiple device support; accommodations for IEP/504 plans.",
    reportingDashboard: "Real-time progress monitoring; parent/guardian portals.",
    ncaaApproval: "Select courses NCAA-eligible.",
    implementationModel: "During school year, summer, or at-home independent; flexible timing.",
    strengths: ["24/7 live teacher support", "Credit by Exam pathway", "Strong dropout re-engagement track record"],
    limitations: ["Less granular per-lesson skipping than Odysseyware CRx", "Interface dated in some modules"],
  },
  {
    rank: 5,
    name: "Edmentum Courseware (PLATO successor)",
    vendor: "Edmentum",
    color: "bg-indigo-600",
    badgeColor: "bg-indigo-100 text-indigo-800",
    stateSources: ["Florida DOE (PLATO heritage)", "South Carolina DOE", "Michigan MDE", "West Virginia DOE"],
    adoptionNote: "PLATO Learning evolved into Edmentum Courseware; deep Southern state adoption; used by FLVS-adjacent districts.",
    deliveryModel: "Self-paced, media-rich online courses; face-to-face, hybrid, or fully online.",
    courseCount: "200+ core and elective courses",
    crSpecificFeature: "Exemptive pretests identify mastered content; students only complete gaps. Customizable course content alignment.",
    adaptiveLearning: "Exemptive pretesting model; teachers can customize which standards a student must demonstrate.",
    teacherSupport: "Real-time reporting; teacher-managed course paths; certified instructor services available.",
    integrityTools: "On-site proctoring recommended; progress analytics flag anomalies.",
    accessibility: "State-standard aligned; accommodations built in.",
    reportingDashboard: "Standards-aligned gradebook; district-level aggregated reporting.",
    ncaaApproval: "Certain full courses eligible.",
    implementationModel: "Computer lab, classroom, or hybrid; used in blended dropout recovery.",
    strengths: ["Deep Southern state relationships", "Strong standards-alignment customization", "Broad Edmentum ecosystem"],
    limitations: ["PLATO brand legacy creates confusion", "Less AI-augmented than newer platforms"],
  },
  {
    rank: 6,
    name: "Florida Virtual School (FLVS)",
    vendor: "Florida Virtual School (State Agency)",
    color: "bg-green-600",
    badgeColor: "bg-green-100 text-green-800",
    stateSources: ["Florida DOE (primary)", "Available nationally via FLVS Global"],
    adoptionNote: "One of the largest public virtual schools in the US; state-funded in Florida; available nationally via Global program.",
    deliveryModel: "Asynchronous, self-paced with active certified teacher assigned to each student.",
    courseCount: "190+ courses, core through AP and electives",
    crSpecificFeature: "Dedicated credit recovery enrollment for students who previously failed; students retake course with teacher.",
    adaptiveLearning: "Not test-out based; full course completion required for credit recovery track.",
    teacherSupport: "Every student is assigned a Florida-certified teacher who grades, communicates, and provides feedback.",
    integrityTools: "Segment and module exams proctored; EOC exams count 30% of grade per FL statute.",
    accessibility: "ADA compliant; student support services for ELL and ESE students.",
    reportingDashboard: "Parent observer access; teacher gradebooks; district partner dashboards.",
    ncaaApproval: "NCAA-approved courses available.",
    implementationModel: "Primarily fully online and asynchronous; available year-round.",
    strengths: ["Every student has a live certified teacher", "NCAA-approved courses", "State agency accountability and transparency"],
    limitations: ["Full course completion required (no test-out)", "Florida-law compliance requirements for in-state; different terms nationally"],
  },
  {
    rank: 7,
    name: "Subject (Subject.com)",
    vendor: "Subject, Inc.",
    color: "bg-rose-600",
    badgeColor: "bg-rose-100 text-rose-800",
    stateSources: ["California (Calexico USD)", "Texas", "Emerging in multiple states"],
    adoptionNote: "Fastest-growing newer provider; cited by educators as preferred over Edgenuity/Edmentum in head-to-head pilots.",
    deliveryModel: "Video-first, cinematic story-driven lessons; mobile-first design.",
    courseCount: "Core high school subjects; catalog growing",
    crSpecificFeature: "AI-powered academic assistant 'Spark' provides 24/7 help; video-first engagement model designed for students who disengage from text.",
    adaptiveLearning: "AI assistant personalizes hints and support; engagement analytics adjust pacing nudges.",
    teacherSupport: "Real-time live chat with teachers; Spark AI support outside hours; progress alerts.",
    integrityTools: "Academic integrity tools built-in; AI monitoring.",
    accessibility: "Mobile-first; multilingual support.",
    reportingDashboard: "Completion analytics; engagement scoring; district dashboards.",
    ncaaApproval: "In progress / limited.",
    implementationModel: "Flexible: in-class, lab, or home; summer school and year-round.",
    strengths: ["Highest student engagement ratings", "AI tutor Spark is 24/7", "Cinematic video format re-engages disengaged students"],
    limitations: ["Newer platform with smaller course catalog", "NCAA approval limited", "Less longitudinal outcome data available"],
  },
  {
    rank: 8,
    name: "American High School Academy (AHSA)",
    vendor: "American High School Academy",
    color: "bg-yellow-600",
    badgeColor: "bg-yellow-100 text-yellow-800",
    stateSources: ["Multiple state partnerships; district-contract model"],
    adoptionNote: "District-focused turnkey solution; strong wraparound support model; used in urban at-risk populations.",
    deliveryModel: "Online courses with wraparound support including counseling, career pathways, and STEM tracks.",
    courseCount: "Core and CTE/STEM pathways",
    crSpecificFeature: "Turnkey district solution: credit recovery integrated with counseling, re-engagement, and dropout prevention.",
    adaptiveLearning: "Counselor-driven personalization; not automated test-out.",
    teacherSupport: "Dedicated counselors, advisory support, and mentoring alongside online courses.",
    integrityTools: "Supervised lab environment preferred.",
    accessibility: "Designed for at-risk youth including ELL and IEP populations.",
    reportingDashboard: "District-facing reports; graduation tracking; re-enrollment metrics.",
    ncaaApproval: "Selected courses.",
    implementationModel: "Lab-based, summer school, after-school, evening; emphasizes attendance and re-engagement.",
    strengths: ["Holistic wraparound support (counseling + academics)", "STEM and CTE pathways", "Strong re-engagement model for at-risk youth"],
    limitations: ["Less automated personalization", "Smaller vendor with fewer third-party efficacy studies"],
  },
  {
    rank: 9,
    name: "Keystone School Online",
    vendor: "Keystone School (Lincoln Learning Solutions)",
    color: "bg-cyan-600",
    badgeColor: "bg-cyan-100 text-cyan-800",
    stateSources: ["Pennsylvania DOE", "Nationally accredited; accepted in most U.S. states"],
    adoptionNote: "Widely recognized accredited provider; used by students whose home districts accept Keystone transcripts.",
    deliveryModel: "Self-paced online courses; student works independently with teacher available.",
    courseCount: "100+ courses; core and electives",
    crSpecificFeature: "Students enroll in the specific course they failed; complete full course for accredited credit; transcript transferable.",
    adaptiveLearning: "Not adaptive/test-out; full course required.",
    teacherSupport: "Teacher available for questions; primarily independent study.",
    integrityTools: "On-site or supervised proctoring for final exams.",
    accessibility: "Any-device; accommodations available on request.",
    reportingDashboard: "Student progress reports; transcript services.",
    ncaaApproval: "Accredited; NCAA eligibility requires case-by-case review.",
    implementationModel: "Primarily independent/home; also used in supervised lab settings.",
    strengths: ["Fully accredited transcripts accepted broadly", "Simple, affordable per-course pricing", "No district contract required"],
    limitations: ["No adaptive/test-out model", "Less data-driven than district platforms", "Independent without strong real-time monitoring"],
  },
  {
    rank: 10,
    name: "Excel High School",
    vendor: "Excel High School",
    color: "bg-lime-600",
    badgeColor: "bg-lime-100 text-lime-800",
    stateSources: ["Minnesota DOE accreditation", "Nationally accepted transcripts"],
    adoptionNote: "Popular among students seeking affordable individual course enrollment; used when district platform is unavailable.",
    deliveryModel: "100% online, self-paced; student-directed with teacher support on request.",
    courseCount: "100+ courses; core and electives",
    crSpecificFeature: "Flexible per-course enrollment; designed for students who need to recover specific credits individually.",
    adaptiveLearning: "Not adaptive; standard course delivery.",
    teacherSupport: "Responsive teacher feedback; student can request support.",
    integrityTools: "Proctored final exams; academic integrity policies.",
    accessibility: "Online; any device; 24/7 access.",
    reportingDashboard: "Student grade reporting; transcript issued on completion.",
    ncaaApproval: "Case-by-case review; not blanket NCAA-approved.",
    implementationModel: "Primarily individual/home enrollment; flexible pacing.",
    strengths: ["Lowest cost per course", "No district partnership required", "Fully self-directed for motivated students"],
    limitations: ["No adaptive learning", "Minimal real-time monitoring for districts", "Less suited for at-risk students needing support structure"],
  },
]

const differentiators = [
  {
    dimension: "Adaptive / Test-Out Learning",
    icon: Brain,
    color: "text-blue-600",
    description: "Whether students can skip already-mastered content via diagnostic assessment.",
    leaders: ["Imagine Odysseyware CRx", "Apex Learning (ILP)", "K12 Rebound", "Imagine Edgenuity"],
    detail: "Odysseyware CRx and Apex ILP are the gold standard: unit-level granularity. Edgenuity uses course-level pretesting. Keystone, Excel, and FLVS require full course completion.",
  },
  {
    dimension: "Instructional Delivery Style",
    icon: BookOpen,
    color: "text-purple-600",
    description: "How content is primarily presented to students.",
    leaders: ["Edgenuity (video)", "Subject.com (cinematic video)", "FLVS (teacher-led)", "Apex (text + interactive)"],
    detail: "Edgenuity and Subject use video-first approaches. Apex and Edmentum rely on structured text. FLVS uniquely pairs each student with a live certified teacher.",
  },
  {
    dimension: "Teacher / Human Support",
    icon: Users,
    color: "text-teal-600",
    description: "Availability and quality of certified teacher support.",
    leaders: ["FLVS (every student gets a teacher)", "K12 Rebound (24/7 live)", "Subject.com (live chat)", "AHSA (wraparound)"],
    detail: "FLVS provides the strongest 1:1 teacher relationship. K12 offers 24/7 live help. Subject adds AI + live chat. Most platforms provide on-demand or email-based support only.",
  },
  {
    dimension: "AI & Technology Innovation",
    icon: Sparkles,
    color: "text-rose-600",
    description: "Use of artificial intelligence to personalize or support learning.",
    leaders: ["Subject.com (Spark AI)", "Imagine Edgenuity (AI Grading)", "Apex (ILP algorithms)"],
    detail: "Subject's Spark AI provides real-time conversational tutoring. Edgenuity uses AI for essay grading assistance. Traditional platforms rely on rules-based branching rather than true AI.",
  },
  {
    dimension: "Equity & Accessibility",
    icon: Scale,
    color: "text-orange-600",
    description: "Language access, disability accommodations, and barrier removal.",
    leaders: ["Odysseyware (23 languages)", "Edgenuity (translation + read-aloud)", "FLVS (ELL/ESE services)", "AHSA (at-risk wraparound)"],
    detail: "Odysseyware leads on multilingual access. FLVS and AHSA provide the strongest holistic support for ELL and students with disabilities. Most platforms offer some ADA compliance but vary in depth.",
  },
  {
    dimension: "Academic Rigor & Integrity",
    icon: CheckCircle,
    color: "text-green-600",
    description: "Tools and policies to ensure credit recovery reflects genuine learning.",
    leaders: ["Imagine Edgenuity (Proctorio, Speed Radar)", "FLVS (EOC law compliance)", "Apex (departmental assessments)"],
    detail: "Edgenuity's Plagiarism Checker and Speed Radar are the most technologically robust. FLVS is legally mandated to require EOC exams at 30% of grade. Districts are increasingly adding on-site exams regardless of platform.",
  },
  {
    dimension: "NCAA Eligibility",
    icon: Trophy,
    color: "text-yellow-600",
    description: "Whether courses count for NCAA Division I/II eligibility.",
    leaders: ["FLVS", "K12 Rebound (select)", "Edmentum full-length", "Apex full-length"],
    detail: "Full-length (non-prescriptive) courses on most platforms can be NCAA-eligible. Credit-recovery-specific shortened versions are generally not NCAA-approved. Districts should verify each course individually.",
  },
  {
    dimension: "Holistic / Wraparound Support",
    icon: TrendingUp,
    color: "text-indigo-600",
    description: "Counseling, mentoring, SEL, and re-engagement support beyond academics.",
    leaders: ["AHSA", "K12 Rebound (dropout re-engagement)", "FLVS (student services)", "Subject.com (engagement AI)"],
    detail: "AHSA stands alone in integrating counseling, career pathways, and mentoring. K12 Rebound was purpose-built for dropout recovery. Other platforms focus primarily on academic content without holistic services.",
  },
]

const idealPrompt = `You are an expert instructional designer and education technologist commissioned by the U.S. Department of Education to design the ideal, nationally deployable Credit Recovery Program for public high school students. Draw from research-backed best practices, the most effective features of the top programs currently in use across U.S. districts (Imagine Edgenuity, Apex Learning, Imagine Odysseyware CRx, K12 Rebound, Edmentum Courseware, FLVS, Subject.com, AHSA, Keystone, and Excel High School), and findings from the American Institutes for Research (AIR 2024), the Institute of Education Sciences (IES), and the Education Research Strategies framework.

DESIGN OBJECTIVES:
Design a comprehensive credit recovery program system that achieves all of the following goals simultaneously:

1. ADAPTIVE, MASTERY-BASED LEARNING
   - Implement a granular diagnostic pre-assessment at both the course level and unit level (like Odysseyware CRx) to identify exactly which standards each student has and has not mastered.
   - Automatically generate a personalized learning path that skips mastered content and assigns only the specific lessons, modules, or standards a student needs to demonstrate proficiency.
   - Use true adaptive algorithms (not just rules-based branching) that continuously re-adjust the learning path based on ongoing performance data.
   - Base credit award on demonstrated mastery of priority/power standards, not seat time.

2. ENGAGING, MULTI-MODAL INSTRUCTION
   - Deliver instruction using short-form, cinematic, professionally produced video lessons (like Subject.com) combined with interactive practice, Socratic questioning, and real-world application scenarios.
   - Include text-based alternatives for all video content to serve students with diverse learning preferences and connectivity constraints.
   - Design micro-lesson units (10–15 minutes each) to accommodate attention spans and scheduling flexibility.
   - Incorporate gamification elements (progress bars, badges, milestone celebrations) to maintain motivation without trivializing academic content.

3. TIERED HUMAN SUPPORT SYSTEM
   - Assign every student a certified, subject-matter-expert teacher who is responsible for their progress, provides personalized feedback on open-response tasks, and makes proactive outreach when a student falls behind (model: FLVS).
   - Supplement teacher support with a 24/7 AI academic assistant (model: Subject Spark) capable of answering subject-specific questions, explaining concepts, and guiding students through problems without giving away answers.
   - Provide a second tier of counseling and re-engagement support: each student at risk of not completing has access to a graduation coach or counselor who addresses attendance, motivation, family, and socio-emotional barriers (model: AHSA wraparound).
   - Offer live virtual tutoring sessions in core subjects (math, English, science) that students can book on demand.

4. ACADEMIC INTEGRITY INFRASTRUCTURE
   - Integrate lockdown browser technology for all summative assessments.
   - Require at least one on-site, in-person proctored final examination per course (either at the home school or designated testing center).
   - Include AI-powered academic integrity monitoring (plagiarism detection, behavioral biometrics, writing style analysis).
   - Establish a "departmental assessment" requirement: before credit is awarded, the student's home school teacher or department chair must verify demonstrated proficiency through at least one performance task (project, oral examination, or lab) aligned to the course's priority standards.

5. EQUITY AND UNIVERSAL ACCESSIBILITY
   - Provide full language access in the 10 most common languages spoken by U.S. public school students (Spanish, Chinese, Vietnamese, Arabic, Tagalog, French, Haitian Creole, Portuguese, Russian, Somali) with professional translation of instructional content (not just UI labels).
   - Ensure WCAG 2.2 AA compliance for all content: screen-reader compatible, closed-captioned video, keyboard-navigable interfaces.
   - Support offline download of lesson content so students in low-bandwidth environments can complete coursework.
   - Waive or subsidize program fees for students qualifying for free/reduced lunch.
   - Provide built-in IEP/504 accommodation workflows so teachers can digitally document and enforce accommodations within the platform.
   - Offer mobile-first design so students without laptops can fully participate via smartphone.

6. FLEXIBLE SCHEDULING AND DELIVERY MODELS
   - Support all four delivery configurations: (a) supervised computer lab with on-site staff; (b) blended classroom with certified subject teacher; (c) fully asynchronous at-home completion; (d) after-school, evening, weekend, and summer program delivery.
   - Allow year-round enrollment with rolling start dates so students can begin credit recovery the moment they fail a course.
   - Design each credit-recovery course to be completable in 10 weeks or less for a motivated student, with a maximum window of one academic year.
   - Allow students to pause and resume without penalty, with all progress preserved indefinitely.

7. DATA TRANSPARENCY AND CONTINUOUS IMPROVEMENT
   - Provide real-time dashboards for teachers, school counselors, principals, and district administrators showing: individual student progress, time-on-task, mastery by standard, predicted completion date, and risk flags.
   - Generate automated early-warning alerts when a student has not logged in for 3 or more consecutive days.
   - Publish annual, publicly accessible outcome reports by school and district showing: credit recovery completion rates, subsequent course performance (do students succeed in the next-level course?), and graduation rates for participating students.
   - Build in formative data loops so districts can identify which standards students most commonly fail and feed that back to classroom teachers to prevent the need for credit recovery in the first place.

8. NCAA AND TRANSFER ELIGIBILITY
   - Design all full-length courses to meet NCAA Eligibility Center core course requirements.
   - Clearly label which course versions (full vs. prescriptive) are and are not NCAA-eligible.
   - Ensure course transcripts from this program are accepted by all U.S. state graduation requirements through state-by-state standards alignment documentation.
   - Partner with regional accreditation bodies to ensure credits are transferable across all 50 states and the District of Columbia.

9. COST EQUITY AND STATE FUNDING ALIGNMENT
   - Structure the program's pricing model to be accessible to Title I districts without requiring external grant funding.
   - Provide a free, standards-aligned curriculum layer that any district can access without a vendor contract (open educational resources framework).
   - Build funding guidance into the platform: link each program feature to eligible federal funding streams (ESSER successor funds, Title I, Title IV-A, Perkins V for CTE courses).

10. PREVENTION-FIRST INTEGRATION
    - Include an early intervention module that flags students at risk of failing their original course (based on formative assessment data, attendance, and engagement patterns) and triggers a "micro-recovery" pathway before the course is failed.
    - Provide teachers with differentiated instruction resources aligned to the same standards used in the credit recovery courses, so classroom instruction and recovery are conceptually unified.
    - Offer an "extended semester" option (2-week post-semester window) for students who are close to passing to complete specific missing standards before being formally assigned to credit recovery.

CONSTRAINTS AND REQUIREMENTS:
- All content must be aligned to Common Core State Standards (CCSS) for ELA/Math and Next Generation Science Standards (NGSS) for Science, with state-specific variant modules for non-adopting states (Texas TEKS, Virginia SOLs, Florida B.E.S.T., etc.).
- The program must comply with FERPA, COPPA, CIPA, and applicable state student data privacy laws.
- Implementation must include a Train-the-Trainer professional development module for district staff.
- The platform must integrate via LTI 1.3 and API with the major SIS platforms (PowerSchool, Infinite Campus, Skyward, Clever) for seamless enrollment and grade passback.
- The program must have been evaluated using a rigorous research design (quasi-experimental at minimum, RCT preferred) with published outcomes prior to national rollout.

OUTPUT FORMAT:
Produce a complete program specification document organized into the following sections:
(A) Program Philosophy and Theory of Change
(B) Curriculum Framework and Standards Alignment Map
(C) Adaptive Learning System Architecture
(D) Instructional Design Standards for All Content
(E) Human Support System Structure and Staffing Model
(F) Academic Integrity Policy and Technical Controls
(G) Equity, Accessibility, and Inclusion Framework
(H) Scheduling and Delivery Model Options
(I) Data Governance, Privacy, and Reporting Standards
(J) Funding Model and Cost-per-Student Analysis
(K) Prevention and Early Intervention Integration
(L) Implementation Roadmap for Districts (Year 1, Year 2, Year 3)
(M) Evaluation Plan and Success Metrics`

const researchSources = [
  {
    organization: "American Institutes for Research (AIR)",
    document: "Landscape of High School Credit Recovery in U.S. Public Schools (2024)",
    url: "https://www.air.org/sites/default/files/2024-08/Online-Credit-Recovery-Study-Brief-12-Landscape-of-High-School-Credit-Recovery-August-2024.pdf",
    keyFindings: "86% of districts use external online company platforms; 81% use computer lab + staff support; 93% use some form of online instruction for credit recovery.",
  },
  {
    organization: "Institute of Education Sciences (IES) / U.S. Dept. of Education",
    document: "Assessing the Efficacy of Online Credit Recovery on Student Learning and High School Graduation",
    url: "https://ies.ed.gov/use-work/awards/assessing-efficacy-online-credit-recovery-student-learning-and-high-school-graduation",
    keyFindings: "Online credit recovery students who had teacher instructional support performed as well as face-to-face students; independent online-only was weakest.",
  },
  {
    organization: "Education Research Strategies",
    document: "Credit Recovery in High School (2023)",
    url: "https://www.erstrategies.org/wp-content/uploads/2023/12/Credit_Recovery_in_High_School_FINAL_FINAL_FINAL.pdf",
    keyFindings: "Recommends targeted diagnostics, mastery-based assessment, equitable access, and continuous improvement cycles as four pillars of effective programs.",
  },
  {
    organization: "Education Commission of the States",
    document: "State Information Request: Credit Recovery",
    url: "https://www.ecs.org/wp-content/uploads/State-Information-Request_Credit-Recovery.pdf",
    keyFindings: "State policies on credit recovery vary widely; most do not mandate specific platforms but do require standards alignment and transcript integrity.",
  },
  {
    organization: "Colorado Department of Education",
    document: "Persistence, Recovery, Reengagement: Dropout Prevention Framework",
    url: "https://ed.cde.state.co.us/dropoutprevention/recoverydropoutpreventionframework",
    keyFindings: "Colorado framework ties credit recovery to dropout prevention; emphasizes flexible scheduling and counselor involvement.",
  },
  {
    organization: "Tennessee Comptroller of the Treasury",
    document: "Credit Recovery in Tennessee High Schools",
    url: "https://comptroller.tn.gov/office-functions/research-and-education-accountability/publications/pre-12/credit-recovery-in-tennessee-high-schools.html",
    keyFindings: "Districts should ensure instructional materials align to state academic standards; recommends limited-use waivers for non-pre-approved materials.",
  },
]

function Trophy({ className }: { className?: string }) {
  return <GraduationCap className={className} />
}

export default function CreditRecoveryPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b bg-white dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-base font-bold text-white">
              MT
            </div>
            <span className="text-xl font-semibold text-teal-700 dark:text-teal-400">MathTriumph</span>
          </Link>
          <Button variant="ghost" className="flex items-center gap-2" render={<Link href="/" />}>
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <div className="border-b bg-gradient-to-br from-teal-700 to-indigo-800 py-16 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center gap-3 mb-4">
            <GraduationCap className="h-8 w-8 text-teal-300" />
            <Badge className="bg-teal-500/20 text-teal-200 border-teal-400/30 text-sm">
              U.S. Education Research — April 2026
            </Badge>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Top 10 Credit Recovery Programs
            <span className="block text-teal-300 mt-1">in U.S. High School Districts</span>
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-teal-100">
            A comprehensive comparison of the most widely adopted platforms, their key differentiators,
            and a research-backed prompt for designing the ideal national credit recovery program —
            drawing from state departments of education and independent research bodies across all 50 states.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm text-teal-200">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Sources: AIR, IES, ECS, State DOEs</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> 10 Programs Analyzed</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> 8 Differentiating Dimensions</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4" /> Master AI Prompt Included</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-16">

        {/* Context Banner */}
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Lightbulb className="h-6 w-6 shrink-0 text-blue-600 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 dark:text-blue-200">Why Credit Recovery Matters</p>
                <p className="mt-1 text-sm text-blue-800 dark:text-blue-300">
                  89% of U.S. high schools offer at least one credit recovery course. 93% of districts use online instruction
                  for credit recovery, with 86% relying on programs built by external online learning companies (AIR, 2024).
                  The three biggest challenges district leaders cite are <strong>scheduling, staffing, and funding</strong> —
                  not curriculum quality. Effective credit recovery is a critical lever for improving graduation rates,
                  particularly for historically underserved students.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top 10 Programs */}
        <section>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <LayoutGrid className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                The Top 10 Programs
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Ranked by breadth of district adoption and presence in state-level documentation. State sources listed are departments of education or official state agencies that reference or approve each platform.
            </p>
          </div>

          <div className="space-y-6">
            {programs.map((p) => (
              <Card key={p.rank} className="overflow-hidden border shadow-sm">
                <div className={`h-1.5 w-full ${p.color}`} />
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${p.color} text-white font-bold text-sm`}>
                        #{p.rank}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{p.name}</CardTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Vendor: {p.vendor}</p>
                      </div>
                    </div>
                    <Badge className={`${p.badgeColor} text-xs`}>{p.courseCount}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic border-l-4 border-gray-200 pl-3">
                    {p.adoptionNote}
                  </p>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Delivery Model</p>
                      <p className="text-gray-600 dark:text-gray-400">{p.deliveryModel}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Credit Recovery Feature</p>
                      <p className="text-gray-600 dark:text-gray-400">{p.crSpecificFeature}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Adaptive Learning</p>
                      <p className="text-gray-600 dark:text-gray-400">{p.adaptiveLearning}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Teacher / Human Support</p>
                      <p className="text-gray-600 dark:text-gray-400">{p.teacherSupport}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Integrity Tools</p>
                      <p className="text-gray-600 dark:text-gray-400">{p.integrityTools}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Accessibility</p>
                      <p className="text-gray-600 dark:text-gray-400">{p.accessibility}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Reporting Dashboard</p>
                      <p className="text-gray-600 dark:text-gray-400">{p.reportingDashboard}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">NCAA Eligibility</p>
                      <p className="text-gray-600 dark:text-gray-400">{p.ncaaApproval}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Implementation Model</p>
                      <p className="text-gray-600 dark:text-gray-400">{p.implementationModel}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <div className="flex-1 min-w-48">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Key Strengths</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.strengths.map((s) => (
                          <span key={s} className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            <CheckCircle className="h-3 w-3" /> {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 min-w-48">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Limitations</p>
                      <div className="flex flex-wrap gap-1.5">
                        {p.limitations.map((l) => (
                          <span key={l} className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            {l}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">State Department of Education Sources</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.stateSources.map((src) => (
                        <Badge key={src} variant="secondary" className="text-xs">{src}</Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Differentiators */}
        <section>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Scale className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                How They Differentiate — 8 Key Dimensions
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              No single platform excels on all dimensions. District selection should be driven by which dimensions matter most for their student population.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {differentiators.map((d) => (
              <Card key={d.dimension} className="border shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2.5">
                    <d.icon className={`h-5 w-5 ${d.color}`} />
                    <CardTitle className="text-base">{d.dimension}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{d.description}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Top Performers</p>
                    <div className="flex flex-wrap gap-1.5">
                      {d.leaders.map((l) => (
                        <Badge key={l} className="bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 text-xs">{l}</Badge>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{d.detail}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* AI Prompt */}
        <section>
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Sparkles className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Master AI Prompt: Design the Ideal National Credit Recovery Program
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              This prompt synthesizes the best features from all 10 programs and the research base. Use it with any frontier AI model (GPT-4o, Claude, Gemini) to generate a complete program specification document.
            </p>
          </div>

          <Card className="border-2 border-teal-200 dark:border-teal-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-teal-600" />
                <CardTitle className="text-teal-700 dark:text-teal-300">
                  Ideal Credit Recovery Program Design Prompt
                </CardTitle>
              </div>
              <p className="text-sm text-gray-500">
                Copy and paste this prompt into any AI model to generate a full program specification.
                The prompt covers 10 design objectives, constraints, and a structured output format.
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-gray-900 p-5 text-sm font-mono text-gray-100 whitespace-pre-wrap overflow-auto max-h-[600px] leading-relaxed">
                {idealPrompt}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { label: "Adaptive Mastery-Based Learning", icon: Brain },
                  { label: "Multi-Modal Engaging Instruction", icon: BookOpen },
                  { label: "Tiered Human Support System", icon: Users },
                  { label: "Academic Integrity Infrastructure", icon: ClipboardList },
                  { label: "Equity & Universal Accessibility", icon: Scale },
                  { label: "Flexible Scheduling & Delivery", icon: Zap },
                  { label: "Data Transparency & Improvement", icon: TrendingUp },
                  { label: "NCAA & Transfer Eligibility", icon: GraduationCap },
                  { label: "Cost Equity & Funding Alignment", icon: Star },
                  { label: "Prevention-First Integration", icon: Sparkles },
                ].map(({ label, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2 rounded-md bg-teal-50 dark:bg-teal-900/20 px-3 py-2 text-xs text-teal-800 dark:text-teal-300">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Research Sources */}
        <section>
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Research & State Education Sources
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              All findings draw from the following publicly available documents from state departments of education and national research bodies.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {researchSources.map((src) => (
              <Card key={src.organization} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <Badge className="mb-2 w-fit bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 text-xs">
                    {src.organization}
                  </Badge>
                  <CardTitle className="text-sm leading-snug">{src.document}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-gray-600 dark:text-gray-400">{src.keyFindings}</p>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-teal-600 hover:text-teal-800 dark:text-teal-400 dark:hover:text-teal-200 font-medium"
                  >
                    View Source <ChevronRight className="h-3 w-3" />
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer Note */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Lightbulb className="h-6 w-6 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-900 dark:text-amber-200">Important Note on State Approval</p>
                <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">
                  No single federal or state database lists all approved credit recovery vendors. Approval is primarily managed at the local
                  school district level. Districts should verify that any program they adopt: (1) aligns to their state&apos;s academic
                  standards, (2) meets state transcript/credit requirements, (3) complies with state student data privacy laws,
                  and (4) is accepted by their state&apos;s virtual school or graduation requirement framework.
                  Contact your state Department of Education directly for the most current vendor guidance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-gray-900 mt-8 py-8">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-gray-500">
          <p>Research compiled April 2026 from publicly available state and federal education documents.</p>
          <p className="mt-1">
            <Link href="/" className="text-teal-600 hover:underline">MathTriumph</Link> — Helping students recover, advance, and triumph at every assessment.
          </p>
        </div>
      </footer>
    </div>
  )
}
