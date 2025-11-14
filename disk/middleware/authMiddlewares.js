"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = exports.isMagazineOwner = exports.isTailor = exports.isValidator = exports.isWorkshopOwner = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_js_1 = require("../config/env.js");
/**
 * Middleware to verify JWT token from cookies or Authorization header
 * Attaches decoded user info to req.user
 */
const authenticateToken = (req, res, next) => {
    var _a;
    try {
        // Get token from cookies or Authorization header
        let token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
        if (!token) {
            const authHeader = req.headers['authorization'];
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No authentication token provided"
            });
        }
        // Verify token
        jsonwebtoken_1.default.verify(token, env_js_1.config.jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: "Invalid or expired token"
                });
            }
            // Attach user info to request
            req.user = decoded;
            req.token = token;
            next();
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Authentication error",
            error: err.message
        });
    }
};
exports.authenticateToken = authenticateToken;
/**
 * Middleware to check if user is Workshop Owner
 */
const isWorkshopOwner = (req, res, next) => {
    if (req.user.userType !== 'WORKSHOP_OWNER') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Workshop owner only."
        });
    }
    next();
};
exports.isWorkshopOwner = isWorkshopOwner;
/**
 * Middleware to check if user is Validator
 */
const isValidator = (req, res, next) => {
    if (req.user.userType !== 'VALIDATOR') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Validator only."
        });
    }
    next();
};
exports.isValidator = isValidator;
/**
 * Middleware to check if user is Tailor
 */
const isTailor = (req, res, next) => {
    if (req.user.userType !== 'TAILOR') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Tailor only."
        });
    }
    next();
};
exports.isTailor = isTailor;
/**
 * Middleware to check if user is Magazine Owner
 */
const isMagazineOwner = (req, res, next) => {
    if (req.user.userType !== 'MAGAZINE_OWNER') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Magazine owner only."
        });
    }
    next();
};
exports.isMagazineOwner = isMagazineOwner;
/**
 * Get access token from request
 */
const getAccessToken = (req) => {
    var _a, _b;
    return ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token) ||
        (((_b = req.headers['authorization']) === null || _b === void 0 ? void 0 : _b.startsWith('Bearer ')) ?
            req.headers['authorization'].substring(7) : null);
};
exports.getAccessToken = getAccessToken;
