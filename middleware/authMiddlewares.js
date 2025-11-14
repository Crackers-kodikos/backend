import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/**
 * Middleware to verify JWT token from cookies or Authorization header
 * Attaches decoded user info to req.user
 */
export const authenticateToken = (req, res, next) => {
    try {
        // Get token from cookies or Authorization header
        let token = req.cookies?.access_token;

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
        jwt.verify(token, config.jwtSecret, (err, decoded) => {
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

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Authentication error",
            error: err.message
        });
    }
};

/**
 * Middleware to check if user is Workshop Owner
 */
export const isWorkshopOwner = (req, res, next) => {
    if (req.user.userType !== 'WORKSHOP_OWNER') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Workshop owner only."
        });
    }
    next();
};

/**
 * Middleware to check if user is Validator
 */
export const isValidator = (req, res, next) => {
    if (req.user.userType !== 'VALIDATOR') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Validator only."
        });
    }
    next();
};

/**
 * Middleware to check if user is Tailor
 */
export const isTailor = (req, res, next) => {
    if (req.user.userType !== 'TAILOR') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Tailor only."
        });
    }
    next();
};

/**
 * Middleware to check if user is Magazine Owner
 */
export const isMagazineOwner = (req, res, next) => {
    if (req.user.userType !== 'MAGAZINE_OWNER') {
        return res.status(403).json({
            success: false,
            message: "Access denied. Magazine owner only."
        });
    }
    next();
};

/**
 * Get access token from request
 */
export const getAccessToken = (req) => {
    return req.cookies?.access_token ||
        (req.headers['authorization']?.startsWith('Bearer ') ?
            req.headers['authorization'].substring(7) : null);
};
