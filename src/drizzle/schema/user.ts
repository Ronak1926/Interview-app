import { pgTable, varchar } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "../schemaHelpers";

export const UserTable = pgTable("users", {
    id: varchar().primaryKey(), // not uuid as clerk provides its own user ids
    name: varchar().notNull(),
    email: varchar().notNull().unique(),
    createdAt,
    updatedAt

})