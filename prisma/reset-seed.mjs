import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { Pool } from "pg"

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://mathtriumph_app:mathtriumph_local_dev_pw@localhost:5432/mathtriumph"

const adapter = new PrismaPg(
  new Pool({
    connectionString,
  })
)

const prisma = new PrismaClient({ adapter })

const HASH_ROUNDS = 12
const DEFAULT_PASSWORD = "MathTriumph2026!"
const DEFAULT_DISTRICT_ID = "fl-demo-district"

const seedUsers = [
  {
    fullName: "District Admin",
    email: "district.admin@mathtriumph.local",
    role: "district_admin",
  },
  {
    fullName: "School Admin",
    email: "admin@mathtriumph.local",
    role: "school_admin",
  },
  {
    fullName: "Tech Admin",
    email: "tech@mathtriumph.local",
    role: "tech_admin",
  },
  {
    fullName: "Intervention Specialist",
    email: "interventionist@mathtriumph.local",
    role: "interventionist",
  },
  {
    fullName: "Instructional Coach",
    email: "coach@mathtriumph.local",
    role: "instructional_coach",
  },
  {
    fullName: "Data Analyst",
    email: "data.analyst@mathtriumph.local",
    role: "data_analyst",
  },
  {
    fullName: "Teacher Demo",
    email: "teacher@mathtriumph.local",
    role: "teacher",
  },
  {
    fullName: "Parent Demo",
    email: "parent@mathtriumph.local",
    role: "parent",
  },
  {
    fullName: "Student Demo",
    email: "student@mathtriumph.local",
    role: "student",
  },
  {
    fullName: "Support Admin",
    email: "support@mathtriumph.local",
    role: "support_admin",
  },
]

async function resetAndSeed() {
  const passwordHash = await hash(DEFAULT_PASSWORD, HASH_ROUNDS)

  await prisma.$transaction([
    prisma.passwordResetToken.deleteMany({}),
    prisma.user.deleteMany({}),
  ])

  for (const user of seedUsers) {
    await prisma.user.create({
      data: {
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        districtId: DEFAULT_DISTRICT_ID,
        passwordHash,
      },
    })
  }

  console.log("Reset + seed complete. Demo users recreated.")
  console.log(`Default password for all seeded users: ${DEFAULT_PASSWORD}`)
  for (const user of seedUsers) {
    console.log(`- ${user.role}: ${user.email}`)
  }
}

resetAndSeed()
  .catch((error) => {
    console.error("Reset + seed failed:", error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
