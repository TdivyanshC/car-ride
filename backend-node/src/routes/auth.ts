import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import env from '../config/env';
import User from '../models/User';

const router = express.Router();
const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// POST /auth/google - Verify Google accessToken and return JWT
router.post('/google', async (req, res) => {
  try {
    const { accessToken } = req.body;

    // Step A: Validate input
    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'accessToken is required',
      });
    }

    // Step B: Verify Google token using userinfo endpoint
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google token',
      });
    }

    const payload = await response.json() as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    };
    
    if (!payload || !payload.email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token - no email found',
      });
    }

    // Extract user information from userinfo response
    const { sub: googleId, email, name = '', picture: photo } = payload;

    // Step C: Create or find user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        googleId,
        email,
        name,
        photo,
        provider: 'google',
      });
    } else {
      // Update existing user's photo/name if changed
      if (user.googleId !== googleId) user.googleId = googleId;
      if (user.name !== name) user.name = name;
      if (user.photo !== photo) user.photo = photo;
    }

    await user.save();

    // Step D: Create JWT token
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Step E: Return response
    res.json({
      success: true,
      token,
      user: user.getSafeUser(),
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    
    if (error.code === 'ERR_JWT_EXPIRED' || error.message.includes('Invalid')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google token',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
