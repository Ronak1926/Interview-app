import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { Navbar } from "./_Navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your interview prep sessions, job info, and resume analysis on Incent.",
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: ReactNode }) {
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user == null) return redirect("/onboarding");

  return (
    <>
      <Navbar user={user} />
      {children}
    </>
  );
}
