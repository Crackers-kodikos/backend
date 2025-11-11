import { pgTable, pgSchema, unique, check, serial, varchar, timestamp, foreignKey, integer, text, boolean, time, date } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
    id: serial().primaryKey().notNull(),
    username: varchar({ length: 50 }).notNull(),
    password: varchar({ length: 72 }).notNull(),
    salt: varchar({ length: 255 }),
    refreshtoken: varchar({ length: 255 }),
    creationdate: timestamp({ withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updationdate: timestamp({ withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    avatar: varchar({ length: 255 }),
    email: varchar({ length: 100 }),
    firstname: varchar({ length: 50 }),
    lastname: varchar({ length: 50 }),
}, (table) => [
    unique("users_username_key").on(table.username),
    unique("users_refreshtoken_key").on(table.refreshtoken),
    unique("users_email_key").on(table.email),
    check("users_email_check", sql`(email)::text ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$'::text`),
    check("users_username_check", sql`(length((username)::text) > 3) AND ((username)::text ~ '^[a-zA-Z0-9_]+$'::text)`),
]);
