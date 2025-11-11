// POSTGRESQL CONNECTION
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from "../config/env.js"
import * as schemas from "../db/schemas/schema.js"
import * as relations from "../db/schemas/relations.js"



const db = drizzle(config.databaseUrl, {
    schema: {
        ...schemas,
        ...relations
    }, logger: true
})

export default db
