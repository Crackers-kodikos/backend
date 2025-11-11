import db from "../index.js";
import { reset } from "drizzle-seed";
import { schema } from "../../config/database"

await reset(db, schema)




console.log("reset finished")
