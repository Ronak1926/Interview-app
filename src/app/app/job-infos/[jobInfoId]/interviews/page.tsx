import { getInterviewJobInfoTag } from "@/features/interviews/dbCache";
import JobInfoBackLink from "@/features/jobInfos/components/JobInfoBackLink";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { Loader2 } from "lucide-react";
import { cacheTag } from "next/cache";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();
  return (
    <div className="container py-4 gap-4 h-screen-header flex flex-col items-start">
      <JobInfoBackLink jobInfoId={jobInfoId} />

      <h1 className="text-3xl md:text-4xl">Edit Job Description</h1>

      <Suspense fallback={<Loader2 className="size-24 animate-spin mx-auto" />}>
        <SuspendedPage jobInfoId={jobInfoId} />
      </Suspense>
    </div>
  );
}

async function SuspendedPage({ jobInfoId }: { jobInfoId: string }) {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();

  const interviews = await getInterviews(jobInfoId, userId);

  if (interviews.length === 0) {
    return redirect(`/app/job-infos/${jobInfoId}/interviews/new`);
  }
  return <div>Interview for Job Info ID: {jobInfoId}</div>;
}

async function getInterviews(jobInfoId: string, userId: string) {
  "use cache";
  cacheTag(getInterviewJobInfoTag(jobInfoId));
  cacheTag(getJobInfoIdTag(jobInfoId));

  const data = await db.query.InterviewTable.findMany({
    where: and(
      eq(InterviewTable.jobInfoId, jobInfoId),
      isNotNull(InterviewTable.humeChatId),
    ),
    with: { jobInfo: { columns: { userId: true } } },
    orderBy: desc(InterviewTable.updatedAt),
  });
  return data.filter((interview) => interview.jobInfo.userId === userId);
}
