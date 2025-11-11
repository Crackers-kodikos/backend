import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { users } from '../db/schemas/schema.js';
import { eq } from 'drizzle-orm';
import db from "../db/index.js";
import dotenv from "dotenv"
import { getAccessToken } from "../middleware/authMiddlewares.js";
import { config } from "../config/env.js"



//the registration controller 
export const registerUser = async (req, res) => {
  const { username, password, firstname, lastname } = req.body;
  // checkinng if the user is already exist

  try {
    const existUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existUser.length > 0) {
      res.status(400).json({
        success: false,
        message: "the username already exists "
      })
      return;
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    })
    return;
  }

  // Insert the new user 
  try {
    const saltRounds = config.saltRounds || 5;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    await db.insert(users).values({
      username: username,
      password: hashedPassword,
      firstname: firstname,
      lastname: lastname,
      salt: "nosaltcurrently"
    })
    res.status(201).send({
      success: true,
      message: "the registration is complete successfully"
    })
  }
  catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    })
  }


}




//THE LOGIN CONTROLLER 

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    //checking if the user is exist
    const existUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
    if (existUser.length === 0) {
      res.status(401).json({
        success: false,
        message: "the username is not valide "
      })
      return;
    }

    const user = existUser[0];
    // compare if the password is correct 

    const passwdCorrect = await bcrypt.compare(password, user.password);
    if (!passwdCorrect) {
      res.status(401).json({
        success: false,
        message: "the username or password is not correct !"
      })
      return;
    } else {

      // Genetrate JWT Token for the authentification
      const token = jwt.sign(
        {
          id: user.id,
        }
        , config.jwtSecret,
        { expiresIn: config.jwtExpiresIn || "1d" }
      )
      res.cookie("access_token", token, {
        httpOnly: true,                // Prevents XSS attacks
        secure: config.nodeEnv === "production", // true in production, false in development (for HTTP)
        maxAge: 24 * 60 * 60 * 1000,   // Cookie expires in 1 day (same as token expiration)
        path: "/",                     // Ensure the cookie is available across all paths
      });

      res.status(200).json({
        success: true,
        message: "the login is complete successfuly",
        data: {
          id: user.id,
          accessToken: token
        }
      })
    }

  }
  catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    })
  }
}



// Get the authenticated user's profile data
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user;

    const foundUsers = await db.select().from(users).where(
      eq(users.id, userId)
    ).limit(1)

    if (foundUsers.length === 0) {
      res.status(409).json({
        success: false,
        message: 'The accesstoken has invalid userId!'
      })
      return;
    }
    const user = foundUsers[0]
    console.log(user)
    res.status(200).json({
      success: true,
      message: 'Data retrieved successfully',
      data: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname
      }
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: 'Error retrieving user profile', error: error.message });
  }
};

// Update the authenticated user's profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user;
    const {
      username,
      avatar,
      email,
      firstname,
      lastname
    } = req.body

    const body = {
      username,
      avatar,
      email,
      firstname,
      lastname
    }

    const newData = Object.fromEntries(Object.entries(body).filter((v, i) => v[1] !== null))

    const updated = await db.update(users).set(newData).where(eq(users.id, userId))

    res.json({
      success: true,
      message: 'User`s data updated successfully'
    })
    // ... existing code ...
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};

// Log out the user  ماتخدمهاش مانحتاجوهاش
export const logoutUser = (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: (config.secure),
      sameSite: config.nodeEnv === "production" ? "none" : "lax",
      maxAge: 0,
      path: "/"
    })
    res.status(200).json({
      success: true,
      message: 'The user is logged out successfully'
    })
  } catch (error) {
    res.status(500).json({ message: 'Error updating user profile', error: error.message });
  }
};




export const checkAuth = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'The user is authenticated',
      accessToken: req.token
    })
  }
  catch (err) {
    res.status(500).json({ message: 'Error checking authentication', error: err.message });
  }
}
