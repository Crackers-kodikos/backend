import dotenv from "dotenv";


export const loadEnvironment = (env) => {
  const nodeEnv = (env || process.env.NODE_ENV || "development");

  dotenv.config({
    path: `.env`,
  });

  return {
    nodeEnv,
    port: parseInt(process.env.PORT || "3000"),
    databaseUrl: process.env.DATABASE_URL || "",
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10"),
    jwtSecret: process.env.JWT_SECRET || "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
    allowedOrigins: process.env.ALLOWED_ORIGINS || "*",
    secure: process.env.SECURE === "true",
    isDevelopment: nodeEnv === "development",
    isProduction: nodeEnv === "production",
  };
};

export const config = loadEnvironment();

export default config;