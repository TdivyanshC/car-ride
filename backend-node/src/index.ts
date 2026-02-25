import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import connectDB from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import env from './config/env';
import mongoose from 'mongoose';

const app = express();
const PORT = env.PORT;

// Connect to MongoDB
console.log('Attempting to connect to MongoDB...');
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/api', userRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Car Ride Backend API');
});

// Database connection status route
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  
  res.json({
    server: 'running',
    database: {
      state: stateNames[dbState],
      readyState: dbState,
      connected: dbState === 1,
    },
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MongoDB connected successfully`);
  console.log(`Server running on port ${PORT}`);
});
