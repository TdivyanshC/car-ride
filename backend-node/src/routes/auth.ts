import express from 'express';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import env from '../config/env';
import User from '../models/User';

const router = express.Router();

// Create Google OAuth2 client
const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);

// POST /auth/google - Verify idToken and authenticate user
router.post('/google', async (req, res) => {
  try {
    const { idToken } = req.body;

    // Step A: Validate input
    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: 'idToken is required',
      });
    }

    console.log('Received idToken:', idToken.substring(0, 20) + '...');

    // Step B: Verify the idToken using google-auth-library
    // Use the Web client ID as the audience
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid idToken - no payload',
      });
    }

    // Extract user information from the verified token
    const { sub: googleId, email, name, picture: photo } = payload;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: 'Invalid idToken - no email found',
      });
    }

    console.log('Google user verified:', { email, name });

    // Step C: Create or find user
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user
      user = new User({
        googleId,
        email,
        name: name || '',
        photo,
        provider: 'google',
      });
    } else {
      // Update existing user's googleId, photo/name if changed
      if (user.googleId !== googleId) user.googleId = googleId;
      if (name && user.name !== name) user.name = name;
      if (photo && user.photo !== photo) user.photo = photo;
    }

    await user.save();

    // Step D: Create JWT token
    const jwtToken = jwt.sign(
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
      token: jwtToken,
      user: user.getSafeUser(),
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    
    if (error.message?.includes('Invalid') || error.message?.includes('wrong audience')) {
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
