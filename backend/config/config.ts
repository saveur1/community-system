import { Config } from "@/types/config-types";

const config: Config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key', // Change this to a secure secret in production
    expiresIn: '1d', // Token expiration time
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback',
  },
  database: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "saveur@123",
    databaseName: process.env.DB_NAME || "community_tool",
    dialect: "mysql",
    logging: false,
  },

  bcryptSaltRounds: 10, // Number of salt rounds for bcrypt hashing
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  appUrl: process.env.APP_URL || 'http://localhost:3000',
};

export default config;
