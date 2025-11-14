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
exports.getAllReferralLinks = exports.getReferralLink = exports.checkAuth = exports.logoutUser = exports.updateUserProfile = exports.getUserProfile = exports.loginUser = exports.registerUserWithReferral = exports.registerWorkshopOwner = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const schema_js_1 = require("../db/schemas/schema.js");
const drizzle_orm_1 = require("drizzle-orm");
const index_js_1 = __importDefault(require("../db/index.js"));
const env_js_1 = require("../config/env.js");
// Register Workshop Owner with transaction
const registerWorkshopOwner = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email, firstname, lastname, phone, workshopName, workshopDescription, workshopAddress } = req.body;
        // Validation
        if (!username || !password || !email || !firstname || !lastname || !workshopName) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: username, password, email, firstname, lastname, workshopName"
            });
        }
        // Start transaction
        const result = yield index_js_1.default.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Check existing username and email inside transaction
            const existingUser = yield tx.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.username, username)).limit(1);
            if (existingUser.length > 0) {
                throw new Error("Username already exists");
            }
            const existingEmail = yield tx.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email)).limit(1);
            if (existingEmail.length > 0) {
                throw new Error("Email already exists");
            }
            const saltRounds = env_js_1.config.saltRounds || 10;
            const passwordHash = yield bcrypt_1.default.hash(password, saltRounds);
            // Insert user
            const newUser = yield tx.insert(schema_js_1.users).values({
                username,
                passwordHash,
                salt: crypto_1.default.randomBytes(32).toString('hex'),
                email,
                firstname,
                lastname,
                phone: phone || null,
                userType: 'WORKSHOP_OWNER',
                avatar: null,
                refreshtoken: null,
                creationdate: new Date(),
                updationdate: new Date()
            }).returning();
            const userId = newUser[0].id;
            // Insert workshop
            const newWorkshop = yield tx.insert(schema_js_1.workshops).values({
                ownerUserId: userId,
                name: workshopName,
                description: workshopDescription || null,
                address: workshopAddress || null,
                phone: phone || null,
                subscriptionPlanId: null,
                commissionPercentage: 0,
                createdAt: new Date(),
                updatedAt: new Date()
            }).returning();
            const workshopId = newWorkshop[0].id;
            // Insert referral link
            const referralToken = crypto_1.default.randomBytes(32).toString('hex');
            yield tx.insert(schema_js_1.referralLinks).values({
                workshopId,
                token: referralToken,
                referralType: 'MAGAZINE',
                createdAt: new Date(),
                expiresAt: null,
                isActive: true
            });
            // Generate JWT
            const accessToken = jsonwebtoken_1.default.sign({ id: userId, userType: 'WORKSHOP_OWNER', workshopId }, env_js_1.config.jwtSecret, { expiresIn: env_js_1.config.jwtExpiresIn || '7d' });
            // Generate refresh token
            const refreshToken = crypto_1.default.randomBytes(32).toString('hex');
            yield tx.update(schema_js_1.users).set({ refreshtoken: refreshToken }).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId));
            // Return data (not response) from transaction
            return {
                userId,
                username,
                email,
                firstname,
                lastname,
                workshopId,
                workshopName,
                accessToken,
                refreshToken
            };
        }));
        // Send response OUTSIDE transaction
        res.cookie("access_token", result.accessToken, {
            httpOnly: true,
            secure: env_js_1.config.nodeEnv === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        return res.status(201).json({
            success: true,
            message: "Workshop created successfully",
            data: {
                id: result.userId,
                username: result.username,
                email: result.email,
                firstname: result.firstname,
                lastname: result.lastname,
                userType: 'WORKSHOP_OWNER',
                workshop: {
                    id: result.workshopId,
                    name: result.workshopName
                },
                accessToken: result.accessToken,
                refreshToken: result.refreshToken
            }
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Registration failed",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
exports.registerWorkshopOwner = registerWorkshopOwner;
// Register User with Referral using transaction
const registerUserWithReferral = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password, email, firstname, lastname, phone, userType, referralCode } = req.body;
        if (!username || !password || !email || !firstname || !lastname || !userType || !referralCode) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }
        if (!['MAGAZINE_OWNER', 'TAILOR', 'VALIDATOR'].includes(userType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid userType. Must be MAGAZINE_OWNER, TAILOR, or VALIDATOR"
            });
        }
        // Start transaction
        const result = yield index_js_1.default.transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            // Check existing username and email inside transaction
            const existingUser = yield tx.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.username, username)).limit(1);
            if (existingUser.length > 0) {
                throw new Error("Username already exists");
            }
            const existingEmail = yield tx.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.email, email)).limit(1);
            if (existingEmail.length > 0) {
                throw new Error("Email already exists");
            }
            // Validate referral code
            const referral = yield tx.select().from(schema_js_1.referralLinks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_js_1.referralLinks.token, referralCode), (0, drizzle_orm_1.eq)(schema_js_1.referralLinks.isActive, true)))
                .limit(1);
            if (referral.length === 0) {
                throw new Error("Invalid or expired referral code");
            }
            const workshopId = referral[0].workshopId;
            const saltRounds = env_js_1.config.saltRounds || 10;
            const passwordHash = yield bcrypt_1.default.hash(password, saltRounds);
            // Insert user
            const newUser = yield tx.insert(schema_js_1.users).values({
                username,
                passwordHash,
                salt: crypto_1.default.randomBytes(32).toString('hex'),
                email,
                firstname,
                lastname,
                phone: phone || null,
                userType,
                avatar: null,
                refreshtoken: null,
                creationdate: new Date(),
                updationdate: new Date()
            }).returning();
            const userId = newUser[0].id;
            // Insert user-specific record based on type
            if (userType === 'MAGAZINE_OWNER') {
                yield tx.insert(schema_js_1.magazines).values({
                    ownerUserId: userId,
                    workshopId,
                    shopName: `${firstname}'s Shop`,
                    address: null,
                    phone: phone || null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            else if (userType === 'TAILOR') {
                yield tx.insert(schema_js_1.tailors).values({
                    userId,
                    workshopId,
                    fullName: `${firstname} ${lastname}`,
                    description: null,
                    skills: null,
                    availabilityStatus: 'available',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            else if (userType === 'VALIDATOR') {
                yield tx.insert(schema_js_1.validators).values({
                    userId,
                    workshopId,
                    fullName: `${firstname} ${lastname}`,
                    description: null,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
            // Generate JWT
            const accessToken = jsonwebtoken_1.default.sign({ id: userId, userType, workshopId }, env_js_1.config.jwtSecret, { expiresIn: env_js_1.config.jwtExpiresIn || '7d' });
            // Generate refresh token
            const refreshToken = crypto_1.default.randomBytes(32).toString('hex');
            yield tx.update(schema_js_1.users).set({ refreshtoken: refreshToken }).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId));
            // Return data (not response) from transaction
            return {
                userId,
                username,
                email,
                firstname,
                lastname,
                userType,
                workshopId,
                accessToken,
                refreshToken
            };
        }));
        // Send response OUTSIDE transaction
        res.cookie("access_token", result.accessToken, {
            httpOnly: true,
            secure: env_js_1.config.nodeEnv === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        return res.status(201).json({
            success: true,
            message: `${result.userType} account created successfully`,
            data: result
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Registration failed",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
exports.registerUserWithReferral = registerUserWithReferral;
// Login User
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }
        // Find user
        const foundUsers = yield index_js_1.default.select().from(schema_js_1.users).where((0, drizzle_orm_1.eq)(schema_js_1.users.username, username)).limit(1);
        if (foundUsers.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }
        const user = foundUsers[0];
        // Verify password
        const passwordMatch = yield bcrypt_1.default.compare(password, user.passwordHash);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }
        // Get additional data based on user type
        let additionalData = {};
        if (user.userType === 'WORKSHOP_OWNER') {
            const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
                .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, user.id))
                .limit(1);
            if (workshop.length > 0) {
                additionalData.workshopId = workshop[0].id;
                additionalData.workshopName = workshop[0].name;
            }
        }
        else if (user.userType === 'MAGAZINE_OWNER') {
            const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
                .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, user.id))
                .limit(1);
            if (magazine.length > 0) {
                additionalData.magazineId = magazine[0].id;
                additionalData.workshopId = magazine[0].workshopId;
            }
        }
        else if (user.userType === 'TAILOR') {
            const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
                .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.userId, user.id))
                .limit(1);
            if (tailor.length > 0) {
                additionalData.tailorId = tailor[0].id;
                additionalData.workshopId = tailor[0].workshopId;
            }
        }
        else if (user.userType === 'VALIDATOR') {
            const validator = yield index_js_1.default.select().from(schema_js_1.validators)
                .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, user.id))
                .limit(1);
            if (validator.length > 0) {
                additionalData.validatorId = validator[0].id;
                additionalData.workshopId = validator[0].workshopId;
            }
        }
        // Generate tokens
        const accessToken = jsonwebtoken_1.default.sign(Object.assign({ id: user.id, userType: user.userType }, additionalData), env_js_1.config.jwtSecret, { expiresIn: env_js_1.config.jwtExpiresIn || '7d' });
        const refreshToken = crypto_1.default.randomBytes(32).toString('hex');
        yield index_js_1.default.update(schema_js_1.users).set({ refreshtoken: refreshToken }).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, user.id));
        res.cookie("access_token", accessToken, {
            httpOnly: true,
            secure: env_js_1.config.nodeEnv === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: Object.assign(Object.assign({ id: user.id, username: user.username, email: user.email, firstname: user.firstname, lastname: user.lastname, userType: user.userType }, additionalData), { accessToken,
                refreshToken })
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            message: "Login failed",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
exports.loginUser = loginUser;
// Get User Profile
const getUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const foundUsers = yield index_js_1.default.select().from(schema_js_1.users)
            .where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId))
            .limit(1);
        if (foundUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const user = foundUsers[0];
        let profileData = {
            id: user.id,
            username: user.username,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
            phone: user.phone,
            avatar: user.avatar,
            userType: user.userType
        };
        // Get role-specific data
        if (user.userType === 'WORKSHOP_OWNER') {
            const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
                .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, user.id))
                .limit(1);
            if (workshop.length > 0) {
                profileData.workshop = {
                    id: workshop[0].id,
                    name: workshop[0].name,
                    description: workshop[0].description,
                    address: workshop[0].address,
                    phone: workshop[0].phone
                };
            }
        }
        else if (user.userType === 'MAGAZINE_OWNER') {
            const magazine = yield index_js_1.default.select().from(schema_js_1.magazines)
                .where((0, drizzle_orm_1.eq)(schema_js_1.magazines.ownerUserId, user.id))
                .limit(1);
            if (magazine.length > 0) {
                profileData.magazine = {
                    id: magazine[0].id,
                    shopName: magazine[0].shopName,
                    address: magazine[0].address,
                    phone: magazine[0].phone,
                    workshopId: magazine[0].workshopId
                };
            }
        }
        else if (user.userType === 'TAILOR') {
            const tailor = yield index_js_1.default.select().from(schema_js_1.tailors)
                .where((0, drizzle_orm_1.eq)(schema_js_1.tailors.userId, user.id))
                .limit(1);
            if (tailor.length > 0) {
                profileData.tailor = {
                    id: tailor[0].id,
                    fullName: tailor[0].fullName,
                    description: tailor[0].description,
                    skills: tailor[0].skills,
                    availabilityStatus: tailor[0].availabilityStatus,
                    workshopId: tailor[0].workshopId
                };
            }
        }
        else if (user.userType === 'VALIDATOR') {
            const validator = yield index_js_1.default.select().from(schema_js_1.validators)
                .where((0, drizzle_orm_1.eq)(schema_js_1.validators.userId, user.id))
                .limit(1);
            if (validator.length > 0) {
                profileData.validator = {
                    id: validator[0].id,
                    fullName: validator[0].fullName,
                    description: validator[0].description,
                    workshopId: validator[0].workshopId
                };
            }
        }
        return res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: profileData
        });
    }
    catch (err) {
        console.error("Error retrieving profile:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve profile",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
exports.getUserProfile = getUserProfile;
// Update User Profile
const updateUserProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { firstname, lastname, phone, avatar, email } = req.body;
        const updateData = {};
        if (firstname)
            updateData.firstname = firstname;
        if (lastname)
            updateData.lastname = lastname;
        if (phone)
            updateData.phone = phone;
        if (avatar)
            updateData.avatar = avatar;
        if (email)
            updateData.email = email;
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }
        updateData.updationdate = new Date();
        yield index_js_1.default.update(schema_js_1.users).set(updateData).where((0, drizzle_orm_1.eq)(schema_js_1.users.id, userId));
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully"
        });
    }
    catch (err) {
        console.error("Error updating profile:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
exports.updateUserProfile = updateUserProfile;
// Logout User
const logoutUser = (req, res) => {
    try {
        res.clearCookie("access_token", {
            httpOnly: true,
            secure: env_js_1.config.nodeEnv === "production",
            path: "/"
        });
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Logout failed",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};
exports.logoutUser = logoutUser;
// Check Authentication
const checkAuth = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.status(200).json({
            success: true,
            message: "User is authenticated",
            user: req.user
        });
    }
    catch (err) {
        return res.status(500).json({
            success: false,
            message: "Authentication check failed",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
exports.checkAuth = checkAuth;
// Get Referral Link (Workshop Owners Only)
const getReferralLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { referralType } = req.body;
        if (!referralType || !['MAGAZINE', 'TAILOR', 'VALIDATOR'].includes(referralType)) {
            return res.status(400).json({
                success: false,
                message: "Invalid referralType. Must be MAGAZINE, TAILOR, or VALIDATOR"
            });
        }
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(403).json({
                success: false,
                message: "User is not a workshop owner"
            });
        }
        const workshopId = workshop[0].id;
        // Generate new referral link
        const referralToken = crypto_1.default.randomBytes(32).toString('hex');
        const newReferral = yield index_js_1.default.insert(schema_js_1.referralLinks).values({
            workshopId,
            token: referralToken,
            referralType,
            createdAt: new Date(),
            expiresAt: null,
            isActive: true
        }).returning();
        return res.status(201).json({
            success: true,
            message: "Referral link created successfully",
            data: {
                id: newReferral[0].id,
                token: newReferral[0].token,
                referralType: newReferral[0].referralType,
                createdAt: newReferral[0].createdAt
            }
        });
    }
    catch (err) {
        console.error("Error creating referral link:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to create referral link",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
exports.getReferralLink = getReferralLink;
// Get All Referral Links (Workshop Owners Only)
const getAllReferralLinks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Get workshop
        const workshop = yield index_js_1.default.select().from(schema_js_1.workshops)
            .where((0, drizzle_orm_1.eq)(schema_js_1.workshops.ownerUserId, userId))
            .limit(1);
        if (workshop.length === 0) {
            return res.status(403).json({
                success: false,
                message: "User is not a workshop owner"
            });
        }
        const workshopId = workshop[0].id;
        // Get all referral links
        const links = yield index_js_1.default.select().from(schema_js_1.referralLinks)
            .where((0, drizzle_orm_1.eq)(schema_js_1.referralLinks.workshopId, workshopId));
        return res.status(200).json({
            success: true,
            message: "Referral links retrieved successfully",
            data: links
        });
    }
    catch (err) {
        console.error("Error retrieving referral links:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve referral links",
            error: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
});
exports.getAllReferralLinks = getAllReferralLinks;
