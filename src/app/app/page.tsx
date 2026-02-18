import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { getUser } from "../features/users/actions";
import { Suspense } from "react";
import { Loader2Icon } from "lucide-react";
import { JobInfoTable } from "@/drizzle/schema";
import { db } from "@/drizzle/db";
import { desc, eq } from "drizzle-orm";
import { cacheTag } from "next/cache";
import { getJobInfoUserTag } from "../features/jobInfos/dbCache";
import { Card, CardContent } from "@/components/ui/card";
import { JobInfoForm } from "../features/jobInfos/components/JobInfoForm";

export default async function AppPage() {
  const { userId, user } = await getCurrentUser({ allData: true });
  // console.log("userId in app page:", userId);
  // console.log("user in app page:", user);
  return (
    <Suspense
      fallback={
        <div className="h-screen-header flex items-center justify-center">
          <Loader2Icon className="size-24 animate-spin" />
        </div>
      }
    >
      <JobInfos />
    </Suspense>
  );
}

async function JobInfos() {
  const { userId, redirectToSignIn } = await getCurrentUser();
  if (userId == null) return redirectToSignIn();
  const jobInfos = await getJobInfos(userId);

  if (jobInfos.length === 0) {
    return <NoJobInfos />;
  }
  return null
}

function NoJobInfos() {
  return (
    <div className="container my-4 mx-w-5xl">
      <h1 className="text-2xl font-bold md:text-4xl lg:text-5xl mb-4">
        Welcome to Incent
      </h1>
      <p className="mt-2 text-muted-foreground">
        To get started, enter information about the type of job yu are wanting
        to apply for. this can be specific information copied directly from job
        listing or general information such as the tech stack you want to work
        in. the more specific you are in the description the closer the test
        interview will be to the real thing.
      </p>

      <Card>
         <CardContent>
            <JobInfoForm/>
         </CardContent>
      </Card>
    </div>
  );
}

async function getJobInfos(userId: string) {
  "use cache";
  cacheTag(getJobInfoUserTag(userId));
  return db.query.JobInfoTable.findMany({
    where: eq(JobInfoTable.userId, userId),
    orderBy: desc(JobInfoTable.updatedAt),
  });
}
