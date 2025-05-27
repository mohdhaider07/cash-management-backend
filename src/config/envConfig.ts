import dotenv from "dotenv";
dotenv.config();

export default {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  EMAIL: {
    USER: process.env.EMAIL_USER,
    PASSWORD: process.env.EMAIL_PASSWORD,
    HOST: process.env.EMAIL_HOST,
    FROM: process.env.EMAIL_FROM,
  },
  MAILGUN_API_KEY: process.env.MAILGUN_API_KEY,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
};
