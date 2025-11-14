"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.loadEnvironment = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const loadEnvironment = (env) => {
    const nodeEnv = (env || process.env.NODE_ENV || "development");
    dotenv_1.default.config({
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
exports.loadEnvironment = loadEnvironment;
exports.config = (0, exports.loadEnvironment)();
exports.default = exports.config;
