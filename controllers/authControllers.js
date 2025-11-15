import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { users, workshops, tailors, validators, magazines, referralLinks, subscriptionPlans } from '../db/schemas/schema.js';
import { eq, and } from 'drizzle-orm';
import db from "../db/index.js";
import { config } from "../config/env.js";

// Register Workshop Owner with transaction
export const registerWorkshopOwner = async (req, res) => {
  try {
    const { username, password, email, firstname, lastname, phone, workshopName, workshopDescription, workshopAddress } = req.body;

    // Validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const usernameRegex = /^[a-zA-Z0-9_]{3,}$/;

    if (!username || !password || !email || !firstname || !lastname || !workshopName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: username, password, email, firstname, lastname, workshopName"
      });
    }

    // Validate email format
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format. Must be a valid email address"
      });
    }

    // Validate username format
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        success: false,
        message: "Username must be 3+ characters, containing only letters, numbers, and underscores"
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long"
      });
    }


    // Start transaction
    const result = await db.transaction(async (tx) => {
      // Check existing username and email inside transaction
      const existingUser = await tx.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUser.length > 0) {
        throw new Error("Username already exists");
      }

      const existingEmail = await tx.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingEmail.length > 0) {
        throw new Error("Email already exists");
      }

      const saltRounds = config.saltRounds || 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert user
      const newUser = await tx.insert(users).values({
        username,
        passwordHash,
        salt: crypto.randomBytes(32).toString('hex'),
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
      const newWorkshop = await tx.insert(workshops).values({
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
      const referralToken = crypto.randomBytes(32).toString('hex');
      await tx.insert(referralLinks).values({
        workshopId,
        token: referralToken,
        referralType: 'MAGAZINE',
        createdAt: new Date(),
        expiresAt: null,
        isActive: true
      });

      // Generate JWT
      const accessToken = jwt.sign(
        { id: userId, userType: 'WORKSHOP_OWNER', workshopId },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn || '7d' }
      );

      // Generate refresh token
      const refreshToken = crypto.randomBytes(32).toString('hex');
      await tx.update(users).set({ refreshtoken: refreshToken }).where(eq(users.id, userId));

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
    });

    // Send response OUTSIDE transaction
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
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

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Registration failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Register User with Referral using transaction
export const registerUserWithReferral = async (req, res) => {
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
    const result = await db.transaction(async (tx) => {
      // Check existing username and email inside transaction
      const existingUser = await tx.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUser.length > 0) {
        throw new Error("Username already exists");
      }

      const existingEmail = await tx.select().from(users).where(eq(users.email, email)).limit(1);
      if (existingEmail.length > 0) {
        throw new Error("Email already exists");
      }

      // Validate referral code
      const referral = await tx.select().from(referralLinks)
        .where(and(eq(referralLinks.token, referralCode), eq(referralLinks.isActive, true)))
        .limit(1);

      if (referral.length === 0) {
        throw new Error("Invalid or expired referral code");
      }

      const workshopId = referral[0].workshopId;

      const saltRounds = config.saltRounds || 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Insert user
      const newUser = await tx.insert(users).values({
        username,
        passwordHash,
        salt: crypto.randomBytes(32).toString('hex'),
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
        await tx.insert(magazines).values({
          ownerUserId: userId,
          workshopId,
          shopName: `${firstname}'s Shop`,
          address: null,
          phone: phone || null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else if (userType === 'TAILOR') {
        await tx.insert(tailors).values({
          userId,
          workshopId,
          fullName: `${firstname} ${lastname}`,
          description: null,
          skills: null,
          availabilityStatus: 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else if (userType === 'VALIDATOR') {
        await tx.insert(validators).values({
          userId,
          workshopId,
          fullName: `${firstname} ${lastname}`,
          description: null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      // Generate JWT
      const accessToken = jwt.sign(
        { id: userId, userType, workshopId },
        config.jwtSecret,
        { expiresIn: config.jwtExpiresIn || '7d' }
      );

      // Generate refresh token
      const refreshToken = crypto.randomBytes(32).toString('hex');
      await tx.update(users).set({ refreshtoken: refreshToken }).where(eq(users.id, userId));

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
    });

    // Send response OUTSIDE transaction
    res.cookie("access_token", result.accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.status(201).json({
      success: true,
      message: `${result.userType} account created successfully`,
      data: result
    });

  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Registration failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Login User
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required"
      });
    }

    // Find user
    const foundUsers = await db.select().from(users).where(eq(users.username, username)).limit(1);

    if (foundUsers.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    const user = foundUsers[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.passwordHash);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password"
      });
    }

    // Get additional data based on user type
    let additionalData = {};

    if (user.userType === 'WORKSHOP_OWNER') {
      const workshop = await db.select().from(workshops)
        .where(eq(workshops.ownerUserId, user.id))
        .limit(1);
      if (workshop.length > 0) {
        additionalData.workshopId = workshop[0].id;
        additionalData.workshopName = workshop[0].name;
      }
    } else if (user.userType === 'MAGAZINE_OWNER') {
      const magazine = await db.select().from(magazines)
        .where(eq(magazines.ownerUserId, user.id))
        .limit(1);
      if (magazine.length > 0) {
        additionalData.magazineId = magazine[0].id;
        additionalData.workshopId = magazine[0].workshopId;
      }
    } else if (user.userType === 'TAILOR') {
      const tailor = await db.select().from(tailors)
        .where(eq(tailors.userId, user.id))
        .limit(1);
      if (tailor.length > 0) {
        additionalData.tailorId = tailor[0].id;
        additionalData.workshopId = tailor[0].workshopId;
      }
    } else if (user.userType === 'VALIDATOR') {
      const validator = await db.select().from(validators)
        .where(eq(validators.userId, user.id))
        .limit(1);
      if (validator.length > 0) {
        additionalData.validatorId = validator[0].id;
        additionalData.workshopId = validator[0].workshopId;
      }
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, userType: user.userType, ...additionalData },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn || '7d' }
    );

    const refreshToken = crypto.randomBytes(32).toString('hex');
    await db.update(users).set({ refreshtoken: refreshToken }).where(eq(users.id, user.id));

    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        userType: user.userType,
        ...additionalData,
        accessToken,
        refreshToken
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const foundUsers = await db.select().from(users)
      .where(eq(users.id, userId))
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
      const workshop = await db.select().from(workshops)
        .where(eq(workshops.ownerUserId, user.id))
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
    } else if (user.userType === 'MAGAZINE_OWNER') {
      const magazine = await db.select().from(magazines)
        .where(eq(magazines.ownerUserId, user.id))
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
    } else if (user.userType === 'TAILOR') {
      const tailor = await db.select().from(tailors)
        .where(eq(tailors.userId, user.id))
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
    } else if (user.userType === 'VALIDATOR') {
      const validator = await db.select().from(validators)
        .where(eq(validators.userId, user.id))
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

  } catch (err) {
    console.error("Error retrieving profile:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve profile",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { firstname, lastname, phone, avatar, email } = req.body;

    const updateData = {};
    if (firstname) updateData.firstname = firstname;
    if (lastname) updateData.lastname = lastname;
    if (phone) updateData.phone = phone;
    if (avatar) updateData.avatar = avatar;
    if (email) updateData.email = email;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }

    updateData.updationdate = new Date();

    await db.update(users).set(updateData).where(eq(users.id, userId));

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully"
    });

  } catch (err) {
    console.error("Error updating profile:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Logout User
export const logoutUser = (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: config.nodeEnv === "production",
      path: "/"
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully"
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Check Authentication
export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "User is authenticated",
      user: req.user
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Authentication check failed",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get Referral Link (Workshop Owners Only)
export const getReferralLink = async (req, res) => {
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
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User is not a workshop owner"
      });
    }

    const workshopId = workshop[0].id;

    // Generate new referral link
    const referralToken = crypto.randomBytes(32).toString('hex');
    const newReferral = await db.insert(referralLinks).values({
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

  } catch (err) {
    console.error("Error creating referral link:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to create referral link",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Get All Referral Links (Workshop Owners Only)
export const getAllReferralLinks = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get workshop
    const workshop = await db.select().from(workshops)
      .where(eq(workshops.ownerUserId, userId))
      .limit(1);

    if (workshop.length === 0) {
      return res.status(403).json({
        success: false,
        message: "User is not a workshop owner"
      });
    }

    const workshopId = workshop[0].id;

    // Get all referral links
    const links = await db.select().from(referralLinks)
      .where(eq(referralLinks.workshopId, workshopId));

    return res.status(200).json({
      success: true,
      message: "Referral links retrieved successfully",
      data: links
    });

  } catch (err) {
    console.error("Error retrieving referral links:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve referral links",
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};
