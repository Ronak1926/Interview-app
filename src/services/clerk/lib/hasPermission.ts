import { auth } from "@clerk/nextjs/server"

type Permission =
    | "unlimited_resume_analysis"
    | "unlimited_interviews"
    | "unlimited_questions"
    | "1_interview"
    | "5_questions"
export async function hasPermission(permission: Permission) {
    const { has } = await auth()

    const featureCheck = has({ feature: permission })
    const permissionCheck = has({ permission: `org:${permission}` })

    console.log("Checking permission:", permission)
    console.log("feature:", featureCheck)
    console.log("org permission:", permissionCheck)

    return featureCheck || permissionCheck
}