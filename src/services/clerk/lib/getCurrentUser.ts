import { getUserIdTag } from "@/features/users/dbCache";
import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/cache";

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, redirectToSignIn } = await auth();

  return {
    userId,
    redirectToSignIn,
    user: allData && userId != null ? await getUser(userId) : undefined,
  };
}

async function getUser(id: string) {
  "use cache";
  cacheTag(getUserIdTag(id));

  const allUsers = await db.select().from(UserTable);
  // console.log("[DEBUG getCurrentUser] all users seen by app", allUsers);

  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });

  // console.log("[DEBUG getCurrentUser] getUser result", { id, user });

  return user;
}
