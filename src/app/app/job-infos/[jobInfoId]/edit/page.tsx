import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink";
import { JobInfoForm } from "@/features/jobInfos/components/JobInfoForm";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { cacheTag } from "next/cache";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export default async function JobInfoEditPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const jobInfo = await getJobInfo(jobInfoId, userId);

  if (jobInfo == null) return notFound();

  return (
    <div className="container my-4 max-w-5xl space-y-4">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <h1 className="text-3xl md:text-4xl">Edit Job Description</h1>

      <Card>
        <CardContent>
          <Suspense
            fallback={<Loader2 className="size-24 animate-spin mx-auto" />}
          >
            <JobInfoForm jobInfo={jobInfo} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
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
