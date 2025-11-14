"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactivateReferralLink = exports.deactivateReferralLink = exports.getAllReferralLinks = exports.generateBulkReferralLinks = exports.generateValidatorReferralLink = exports.generateTailorReferralLink = exports.generateMagazineReferralLink = void 0;
const crypto_1 = __importDefault(require("crypto"));
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// Generate Referral Link for Magazine Owner
const generateMagazineReferralLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { expiresInDays } = req.body;
        // Get workshop owned by this user
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only workshop owners can generate referral links"
            });
        }
        const workshopId = workshop[0].id;
        // Generate unique token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        // Calculate expiration date
        let expiresAt = null;
        if (expiresInDays) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + expiresInDays);
            expiresAt = futureDate;
        }
        // Create referral link
        const newLink = yield index_js_1.default.insert(schema_js_1.referralLinks).values({
            workshopId,
            token,
            referralType: 'MAGAZINE',
            createdAt: new Date(),
            expiresAt,
            isActive: true
        }).returning();
        return res.status(201).json({
            success: true,
            message: "Magazine referral link generated successfully",
            data: {
                id: newLink[0].id,
                token: newLink[0].token,
                referralType: newLink[0].referralType,
                expiresAt: newLink[0].expiresAt,
                createdAt: newLink[0].createdAt,
                isActive: newLink[0].isActive,
                referralUrl: `${env_js_1.config.frontendUrl || 'http://localhost:3000'}/register/magazine?code=${token}`
            }
        });
    }
    catch (error) {
        console.error("Error generating magazine referral link:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate referral link",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.generateMagazineReferralLink = generateMagazineReferralLink;
// Generate Referral Link for Tailor
const generateTailorReferralLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { expiresInDays } = req.body;
        // Get workshop owned by this user
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only workshop owners can generate referral links"
            });
        }
        const workshopId = workshop[0].id;
        // Generate unique token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        // Calculate expiration date
        let expiresAt = null;
        if (expiresInDays) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + expiresInDays);
            expiresAt = futureDate;
        }
        // Create referral link
        const newLink = yield index_js_1.default.insert(schema_js_1.referralLinks).values({
            workshopId,
            token,
            referralType: 'TAILOR',
            createdAt: new Date(),
            expiresAt,
            isActive: true
        }).returning();
        return res.status(201).json({
            success: true,
            message: "Tailor referral link generated successfully",
            data: {
                id: newLink[0].id,
                token: newLink[0].token,
                referralType: newLink[0].referralType,
                expiresAt: newLink[0].expiresAt,
                createdAt: newLink[0].createdAt,
                isActive: newLink[0].isActive,
                referralUrl: `${env_js_1.config.frontendUrl || 'http://localhost:3000'}/register/tailor?code=${token}`
            }
        });
    }
    catch (error) {
        console.error("Error generating tailor referral link:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate referral link",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.generateTailorReferralLink = generateTailorReferralLink;
// Generate Referral Link for Validator
const generateValidatorReferralLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { expiresInDays } = req.body;
        // Get workshop owned by this user
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only workshop owners can generate referral links"
            });
        }
        const workshopId = workshop[0].id;
        // Generate unique token
        const token = crypto_1.default.randomBytes(32).toString('hex');
        // Calculate expiration date
        let expiresAt = null;
        if (expiresInDays) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + expiresInDays);
            expiresAt = futureDate;
        }
        // Create referral link
        const newLink = yield index_js_1.default.insert(schema_js_1.referralLinks).values({
            workshopId,
            token,
            referralType: 'VALIDATOR',
            createdAt: new Date(),
            expiresAt,
            isActive: true
        }).returning();
        return res.status(201).json({
            success: true,
            message: "Validator referral link generated successfully",
            data: {
                id: newLink[0].id,
                token: newLink[0].token,
                referralType: newLink[0].referralType,
                expiresAt: newLink[0].expiresAt,
                createdAt: newLink[0].createdAt,
                isActive: newLink[0].isActive,
                referralUrl: `${env_js_1.config.frontendUrl || 'http://localhost:3000'}/register/validator?code=${token}`
            }
        });
    }
    catch (error) {
        console.error("Error generating validator referral link:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate referral link",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.generateValidatorReferralLink = generateValidatorReferralLink;
// Generate Multiple Referral Links at Once
const generateBulkReferralLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { type, count, expiresInDays } = req.body;
        // Validation
        if (!type || !['MAGAZINE', 'TAILOR', 'VALIDATOR'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid type. Must be MAGAZINE, TAILOR, or VALIDATOR"
            });
        }
        if (!count || count < 1 || count > 100) {
            return res.status(400).json({
                success: false,
                message: "Count must be between 1 and 100"
            });
        }
        // Get workshop owned by this user
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only workshop owners can generate referral links"
            });
        }
        const workshopId = workshop[0].id;
        // Generate multiple tokens
        const links = [];
        for (let i = 0; i < count; i++) {
            const token = crypto_1.default.randomBytes(32).toString('hex');
            let expiresAt = null;
            if (expiresInDays) {
                const futureDate = new Date();
                futureDate.setDate(futureDate.getDate() + expiresInDays);
                expiresAt = futureDate;
            }
            const newLink = yield index_js_1.default.insert(schema_js_1.referralLinks).values({
                workshopId,
                token,
                referralType: type,
                createdAt: new Date(),
                expiresAt,
                isActive: true
            }).returning();
            links.push({
                id: newLink[0].id,
                token: newLink[0].token,
                referralUrl: `${env_js_1.config.frontendUrl || 'http://localhost:3000'}/register/${type.toLowerCase()}?code=${token}`,
                expiresAt: newLink[0].expiresAt,
                createdAt: newLink[0].createdAt
            });
        }
        return res.status(201).json({
            success: true,
            message: `${count} ${type.toLowerCase()} referral links generated successfully`,
            data: {
                type,
                count: links.length,
                links
            }
        });
    }
    catch (error) {
        console.error("Error generating bulk referral links:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to generate referral links",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.generateBulkReferralLinks = generateBulkReferralLinks;
// Get All Referral Links for Workshop
const getAllReferralLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { type, isActive } = req.query;
        // Get workshop owned by this user
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only workshop owners can view referral links"
            });
        }
        const workshopId = workshop[0].id;
        // Build query filters
        let query = index_js_1.default.select().from(schema_js_1.referralLinks)
            .where((0, drizzle_orm_1.eq)(schema_js_1.referralLinks.workshopId, workshopId));
        if (type && ['MAGAZINE', 'TAILOR', 'VALIDATOR'].includes(type)) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.referralLinks.referralType, type));
        }
        if (isActive !== undefined) {
            query = query.where((0, drizzle_orm_1.eq)(schema_js_1.referralLinks.isActive, isActive === 'true'));
        }
        const links = yield query;
        // Calculate stats
        const stats = {
            total: links.length,
            active: links.filter(l => l.isActive).length,
            expired: links.filter(l => l.expiresAt && new Date(l.expiresAt) < new Date()).length,
            byType: {
                MAGAZINE: links.filter(l => l.referralType === 'MAGAZINE').length,
                TAILOR: links.filter(l => l.referralType === 'TAILOR').length,
                VALIDATOR: links.filter(l => l.referralType === 'VALIDATOR').length
            }
        };
        return res.status(200).json({
            success: true,
            message: "Referral links retrieved successfully",
            data: {
                stats,
                links: links.map(link => ({
                    id: link.id,
                    token: link.token,
                    type: link.referralType,
                    referralUrl: `${env_js_1.config.frontendUrl || 'http://localhost:3000'}/register/${link.referralType.toLowerCase()}?code=${link.token}`,
                    isActive: link.isActive,
                    expiresAt: link.expiresAt,
                    createdAt: link.createdAt,
                    isExpired: link.expiresAt && new Date(link.expiresAt) < new Date()
                }))
            }
        });
    }
    catch (error) {
        console.error("Error retrieving referral links:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve referral links",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.getAllReferralLinks = getAllReferralLinks;
// Deactivate Referral Link
const deactivateReferralLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { linkId } = req.params;
        // Get workshop owned by this user
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only workshop owners can deactivate referral links"
            });
        }
        const workshopId = workshop[0].id;
        // Verify the link belongs to this workshop
        const link = yield index_js_1.default.select().from(schema_js_1.referralLinks)
            .where((0, drizzle_orm_1.eq)(schema_js_1.referralLinks.id, parseInt(linkId)))
            .limit(1);
        if (link.length === 0 || link[0].workshopId !== workshopId) {
            return res.status(404).json({
                success: false,
                message: "Referral link not found"
            });
        }
        // Deactivate the link
        yield index_js_1.default.update(schema_js_1.referralLinks)
            .set({ isActive: false })
            .where((0, drizzle_orm_1.eq)(schema_js_1.referralLinks.id, parseInt(linkId)));
        return res.status(200).json({
            success: true,
            message: "Referral link deactivated successfully"
        });
    }
    catch (error) {
        console.error("Error deactivating referral link:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to deactivate referral link",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.deactivateReferralLink = deactivateReferralLink;
// Reactivate Referral Link
const reactivateReferralLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { linkId } = req.params;
        const { expiresInDays } = req.body;
        // Get workshop owned by this user
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(403).json({
                success: false,
                message: "Only workshop owners can reactivate referral links"
            });
        }
        const workshopId = workshop[0].id;
        // Verify the link belongs to this workshop
        const link = yield index_js_1.default.select().from(schema_js_1.referralLinks)
            .where((0, drizzle_orm_1.eq)(schema_js_1.referralLinks.id, parseInt(linkId)))
            .limit(1);
        if (link.length === 0 || link[0].workshopId !== workshopId) {
            return res.status(404).json({
                success: false,
                message: "Referral link not found"
            });
        }
        // Calculate new expiration date
        let expiresAt = null;
        if (expiresInDays) {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + expiresInDays);
            expiresAt = futureDate;
        }
        // Reactivate the link
        const updated = yield index_js_1.default.update(schema_js_1.referralLinks)
            .set({ isActive: true, expiresAt })
            .where((0, drizzle_orm_1.eq)(schema_js_1.referralLinks.id, parseInt(linkId)))
            .returning();
        return res.status(200).json({
            success: true,
            message: "Referral link reactivated successfully",
            data: {
                id: updated[0].id,
                token: updated[0].token,
                isActive: updated[0].isActive,
                expiresAt: updated[0].expiresAt
            }
        });
    }
    catch (error) {
        console.error("Error reactivating referral link:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reactivate referral link",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});
exports.reactivateReferralLink = reactivateReferralLink;
