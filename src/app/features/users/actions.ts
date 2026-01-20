'use server'

import { cacheTag } from "next/cache"
import { getUserIdTag } from "./dbCache"
import { eq } from "drizzle-orm"
import { db } from "@/drizzle/db"
import { UserTable } from "@/drizzle/schema"

export async function getUser(id: string) {
    'use cache'
    cacheTag(getUserIdTag(id))
    return db.query.UserTable.findFirst({
        where: eq(UserTable.id, id)
    })
}