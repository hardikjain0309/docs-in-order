import 'dotenv/config';

export const AppConfig = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  GEMINI_KEY: process.env.GEMINI_KEY,
};
