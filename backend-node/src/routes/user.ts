import express from 'express';
import authMiddleware from '../middleware/authMiddleware';
import User from '../models/User';

const router = express.Router();

// GET /me - Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is already attached by authMiddleware
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error: any) {
    console.error('Get user info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;
