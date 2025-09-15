import dotenv from 'dotenv';

if (process.env.NODE_ENV === 'production') {
  dotenv.config({ path: '.env.production' });
} else {
  dotenv.config();
}
export const config = {
  port: process.env.PORT || 3000,
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/posts-api',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  nodeEnv: process.env.NODE_ENV || 'development',
};