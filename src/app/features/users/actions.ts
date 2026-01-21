"use server"

import { cacheTag } from "next/cache"
import { getUserIdTag } from "./dbCache"
import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"
import { eq } from "drizzle-orm"

export async function getUser(id: string) {
  "use cache";
  cacheTag(getUserIdTag(id));

  const allUsers = await db.select().from(UserTable);
  console.log("[DEBUG actions.getUser] all users seen by app", allUsers);

  const user = await db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });

  console.log("[DEBUG actions.getUser] getUser result", { id, user });

  return user;
}