import { timestamp, uuid } from "drizzle-orm/pg-core";

export const id = uuid().primaryKey().defaultRandom();
export const createdAt = timestamp({withTimezone: true})
    .notNull()
    .defaultNow();
export const updatedAt = timestamp({withTimezone: true})
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date() );


// this is the schema helper file where we can define common columns to be reused across multiple tables like id which is a primary key of type uuid, and createdAt and updatedAt timestamps to track record creation and updates and also the $onupdate method to automatically update the updatedAt timestamp whenever the record is modified. and it runs on drizzle-orm with pg