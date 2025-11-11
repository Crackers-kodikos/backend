import db from "../index.js";
import * as schema from "../schemas/schema.js";
import fs from 'fs/promises';

const exercisesData = JSON.parse(await fs.readFile(new URL('./data/exercises.json', import.meta.url)));
const foodsData = JSON.parse(await fs.readFile(new URL('./data/foods.json', import.meta.url)));





const main = async () => {
    console.log("start")
    await db.transaction(async (tx) => {
        try {

        } catch (e) {
            console.error(e);
            await tx.rollback()
        }
    })
}
await main()

