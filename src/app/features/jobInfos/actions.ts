"use server";

import z from "zod";
import { jobInfoSchema } from "./schemas";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { insertJobInfo, updateJobInfo as updateJobInfoDb } from "./db";
import { and, eq } from "drizzle-orm";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { cacheTag } from "next/cache";
import { getJobInfoIdTag } from "./dbCache";

export async function createJobInfo(unsafeData: z.infer<typeof jobInfoSchema>) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "you don't have permission to do this",
    };
  }
  const { success, data } = jobInfoSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "invalid job data",
    };
  }

  const jobInfo = await insertJobInfo({ ...data, userId });

  redirect(`/app/job-infos/${jobInfo.id}`);
}

export async function updateJobInfo(
  id: string,
  unsafeData: z.infer<typeof jobInfoSchema>,
) {
  const { userId } = await getCurrentUser();
  if (userId == null) {
    return {
      error: true,
      message: "you don't have permission to do this",
    };
  }
  const { success, data } = jobInfoSchema.safeParse(unsafeData);
  if (!success) {
    return {
      error: true,
      message: "invalid job data",
    };
  }
  const existingJobInfo = getJobInfo(id, userId);

  if (existingJobInfo == null) {
    return {
        error: true, 
        message: "You don't have permission to do this"
    }

  } 

  const jobInfo = await updateJobInfoDb(id, data);

  redirect(`/app/job-infos/${jobInfo.id}`);
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));
  return await db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
    with: {
      user: true,
    },
  });
}
