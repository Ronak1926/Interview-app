import { db } from "@/drizzle/db"
import { QuestionTable } from "@/drizzle/schema"
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache"
import { getQuestionIdTag } from "@/features/questions/dbCache"
import { generateAiQuestionFeedback } from "@/services/ai/questions"
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser"
import { eq } from "drizzle-orm"
import { cacheTag } from "next/cache"
import z from "zod"
 
const schema = z.object({
  prompt: z.string().min(1),
  questionId: z.string().min(1).optional(),
  question: z.string().min(1).optional(),
})
 
export async function POST(req: Request) {
  const body = await req.json()
  const result = schema.safeParse(body)
 
  if (!result.success) {
    return new Response("Error generating your feedback", { status: 400 })
  }
 
  const { prompt: answer, questionId, question: questionTextFromClient } = result.data
  const { userId } = await getCurrentUser()
 
  if (userId == null) {
    return new Response("You are not logged in", { status: 401 })
  }
 
  const questionText = await (async () => {
    if (questionId != null) {
      const question = await getQuestion(questionId, userId)
      if (question == null) return null
      return question.text
    }
 
    return questionTextFromClient ?? null
  })()
 
  if (questionText == null) {
    return new Response("Error generating your feedback", { status: 400 })
  }
 
  const res = generateAiQuestionFeedback({
    question: questionText,
    answer,
  })
 
  return res.toTextStreamResponse()
}
 
async function getQuestion(id: string, userId: string) {
  "use cache"
  cacheTag(getQuestionIdTag(id))
 
  const question = await db.query.QuestionTable.findFirst({
    where: eq(QuestionTable.id, id),
    with: { jobInfo: { columns: { id: true, userId: true } } },
  })
 
  if (question == null) return null
  cacheTag(getJobInfoIdTag(question.jobInfo.id))
 
  if (question.jobInfo.userId !== userId) return null
  return question
}