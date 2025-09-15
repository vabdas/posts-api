import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/config';
import { UploadedFile } from 'express-fileupload';

// Configure Cloudinary with your credentials

console.log('apikey:', config.cloudinary.apiKey);
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Define types for Cloudinary upload results
interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Uploads a file to Cloudinary
 * @param {UploadedFile} file - The file to upload
 * @param {string} folder - The folder to upload to (optional)
 * @returns {Promise<CloudinaryUploadResult>} - The upload result
 */
export const uploadToCloud = async (
  file: UploadedFile, 
  folder: string = 'posts-api'
): Promise<CloudinaryUploadResult> => {
  try {
    console.log('Starting file upload to Cloudinary...');
    
    // Check if file exists
    if (!file) {
      throw new Error('No file provided for upload');
    }

    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }

    // Convert file to base64 for Cloudinary upload
    const base64Data = file.data.toString('base64');
    const dataUri = `data:${file.mimetype};base64,${base64Data}`;

    console.log('Uploading to Cloudinary...');
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 630, crop: 'limit' }, // Resize for optimal web display
        { quality: 'auto:good' }, // Auto optimize quality
      ],
    });

    console.log('Upload successful:', result.secure_url);
    
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Deletes a file from Cloudinary
 * @param {string} imageUrl - The URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteFromCloud = async (imageUrl: string): Promise<void> => {
  try {
    console.log('Deleting image from Cloudinary:', imageUrl);
    
    // Extract public ID from URL
    const urlParts = imageUrl.split('/');
    const publicIdWithExtension = urlParts[urlParts.length - 1];
    const publicId = publicIdWithExtension.split('.')[0];
    const fullPublicId = `posts-api/${publicId}`;

    console.log('Extracted public ID:', fullPublicId);
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(fullPublicId);
    
    if (result.result !== 'ok') {
      console.warn('Cloudinary deletion result:', result);
      throw new Error('Failed to delete image from Cloudinary');
    }
    
    console.log('Deletion successful');
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Gets Cloudinary account usage information
 * @returns {Promise<any>} - Usage information
 */
export const getCloudinaryUsage = async (): Promise<any> => {
  try {
    const result = await cloudinary.api.usage();
    return result;
  } catch (error) {
    console.error('Error getting Cloudinary usage:', error);
    throw new Error('Failed to get usage information');
  }
};

export default cloudinary;