import { Loader2Icon } from "lucide-react"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { JobInfoBackLink } from "@/features/jobInfos/components/JobInfoBackLink"
import { canRunResumeAnalysis } from "@/features/resumeAnalysis/permissions"
import { RunResumeClient } from "./_client"

export default async function QuestionsPage({
    params,
}: { params: Promise<{ jobInfoId: string }> }) {
    const { jobInfoId } = await params

    return (
        <div className="container py-4 space-y-4 h-screen-header flex flex-col items-start">
        <JobInfoBackLink jobInfoId={jobInfoId}/>
        <Suspense fallback={
                <Loader2Icon className="m-auto animate-spin size-24" />
        }>
            <SuspendedComponent jobInfoId={jobInfoId} />
        </Suspense>
         </div>   

    )
}

async function SuspendedComponent({ jobInfoId }: { jobInfoId: string }) {
    if (!(await canRunResumeAnalysis())) return redirect("/app/upgrade")
    return <RunResumeClient jobInfoId={jobInfoId}/>
}