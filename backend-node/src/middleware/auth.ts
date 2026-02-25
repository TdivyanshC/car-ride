import { Request, Response, NextFunction } from 'express';
import { Document } from 'mongoose';

declare global {
  namespace Express {
    interface User extends Document {
      _id: string;
      googleId: string;
      displayName: string;
      email: string;
      avatar?: string;
      createdAt: Date;
      updatedAt: Date;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};