import dotenv from 'dotenv';

dotenv.config();

const env = process.env;

export const SETTINGS = {
  PORT: env.PORT || 5001,
  MONGO_URL: env.MONGO_URL || 'mongodb://localhost:27017',
  DB_NAME: env.DB_NAME || 'itk-hw',
  ADMIN_USERNAME: env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: env.ADMIN_PASSWORD || 'qwerty',
};
