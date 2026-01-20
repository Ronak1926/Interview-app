import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core"
import { createdAt, id, updatedAt } from "../schemaHelpers"
import { UserTable } from "./user"
import { relations } from "drizzle-orm"
import { QuestionTable } from "./quetion"
import { InterviewTable } from "./interview"

export const experienceLevels = ["junior", "mid-level", "senior"] as const
export type ExperienceLevel = (typeof experienceLevels)[number]
export const experienceLevelEnum = pgEnum(
  "job_infos_experience_level",
  experienceLevels
)

export const JobInfoTable = pgTable("job_info", {
  id,
  title: varchar(),
  name: varchar().notNull(),
  experienceLevel: experienceLevelEnum().notNull(),
  description: varchar().notNull(),
  userId: varchar()
    .references(() => UserTable.id, { onDelete: "cascade" })
    .notNull(),
  createdAt,
  updatedAt,
})

export const jobInfoRelations = relations(JobInfoTable, ({ one, many }) => ({
  user: one(UserTable, {
    fields: [JobInfoTable.userId], // this is as the foreign key in jobInfo table of user
    references: [UserTable.id], // this is the primary key in user table
  }),
  questions: many(QuestionTable),
  interviews: many(InterviewTable),
}))

// for one Job Side (Many-to-One) and user side (one-to-many)