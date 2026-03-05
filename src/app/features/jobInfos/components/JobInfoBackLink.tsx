import { BackLink } from "@/components/BackLink";
import { cn } from "@/lib/utils";
import { cacheTag } from "next/cache";
import { Suspense } from "react";
import { getJobInfoIdTag } from "../dbCache";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";

export default function JobInfoBackLink({
  jobInfoId,
  className,
  userId,
}: {
  jobInfoId: string;
  className?: string;
  userId: string;
}) {
  return (
    <BackLink
      href={`/app/job-infos/${jobInfoId}`}
      className={cn("mb-4", className)}
    >
      <Suspense fallback="Job Description">
        <JobName jobInfoId={jobInfoId} userId={userId} />
      </Suspense>
    </BackLink>
  );
}

async function JobName({
  jobInfoId,
  userId,
}: {
  jobInfoId: string;
  userId: string;
}) {
  const jobInfo = await getJobInfo(jobInfoId, userId);
  return jobInfo?.name ?? "Job Description";
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));
  const jobInfo = await db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
    columns: {
      id: true,
      name: true,
      title: true,
      description: true,
      experienceLevel: true,
    },
  });
  return jobInfo;
}
