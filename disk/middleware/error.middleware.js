"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_js_1 = __importDefault(require("../config/env.js"));
const errors_js_1 = __importDefault(require("../errors/errors.js"));
const errorHandler = (err, req, res, next) => {
    console.error("Error", err);
    if (err instanceof errors_js_1.default.HttpError) {
        if (env_js_1.default.isDevelopment) {
            console.error(err);
            res
                .status(500)
                .json({ success: false, message: err.message, error: err });
            return;
        }
        res.status(err.status).json({ success: false, message: err.message });
        return;
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
    return;
};
exports.default = errorHandler;
