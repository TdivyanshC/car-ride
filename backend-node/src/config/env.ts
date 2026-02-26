import dotenv from 'dotenv';
dotenv.config();

const requiredEnvVars = [
  'PORT',
  'MONGO_URI',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'JWT_SECRET',
];

// Validate environment variables
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Error: ${envVar} is not defined in .env file`);
    process.exit(1);
  }
}

console.log('✅ All required environment variables are defined');

export default {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  JWT_SECRET: process.env.JWT_SECRET!,
};
