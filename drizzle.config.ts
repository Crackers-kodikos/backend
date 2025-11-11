import config from "./config/env.js";

const migrationOutput = config.nodeEnv === "development" ? "/main" : "/dev";

export default {
  out: `./drizzle/${migrationOutput}`,
  schema: "./db/schemas/**/*[.js,.ts]",
  dialect: "postgresql",
  dbCredentials: {
    url: config.databaseUrl!,
  },
};
