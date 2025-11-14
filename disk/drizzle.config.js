"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = __importDefault(require("./config/env.js"));
const migrationOutput = env_js_1.default.nodeEnv === "development" ? "/main" : "/dev";
exports.default = {
    out: `./drizzle/${migrationOutput}`,
    schema: "./db/schemas/**/*[.js,.ts]",
    dialect: "postgresql",
    dbCredentials: {
        url: env_js_1.default.databaseUrl,
    },
};
