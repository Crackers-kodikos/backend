import bcrypt from "bcrypt";
import dotenv from "dotenv";
import db from "../index.js";
import * as schema from "../schemas/schema.js";
import { config } from "../../config/env.js"


const main = async () => {
    await db.transaction(async (tx) => {
        try {

            console.log("seeding finished")
        } catch (e) {
            console.error(e);
            await tx.rollback()
        }
    })
}
await main()

