import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./_client";
import { clerkClient } from "@clerk/nextjs/server";
import { upsertUser } from "@/features/users/db";

export default async function OnboardingPage() {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user != null) return redirect("/app");

  // Webhook may not have fired yet (local dev or race condition).
  // Sync the user directly from Clerk so onboarding never gets stuck.
  let syncedSuccessfully = false;
  try {
    const clerk = await clerkClient();
    const clerkUser = await clerk.users.getUser(userId);
    const email = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress;

    if (email != null) {
      await upsertUser({
        id: clerkUser.id,
        email,
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        imageUrl: clerkUser.imageUrl,
        createdAt: new Date(clerkUser.createdAt),
        updatedAt: new Date(clerkUser.updatedAt),
      });
      syncedSuccessfully = true;
    }
  } catch {
    // Fall through to client-side polling if Clerk API fails
  }

  // redirect() must be called outside try/catch — it throws internally in Next.js
  if (syncedSuccessfully) return redirect("/app");

  return (
    <div className="container flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl">Creating your account...</h1>
      <OnboardingClient userId={userId} />
    </div>
  );
}
