import dotenv from 'dotenv';
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/wealthwise',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key',
    expire: process.env.JWT_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  
  groq: {
    apiKey: process.env.GROQ_API_KEY,
  },
  
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
  },
};

// Validate required environment variables in production
if (config.env === 'production') {
  const required = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'GROQ_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

export default config;
