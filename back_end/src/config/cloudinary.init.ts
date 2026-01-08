import { v2 as cloudinary } from 'cloudinary';

// Cloudinary'yi merkezi olarak configure et
export function initializeCloudinary() {
  const config = {
    cloud_name: process.env.CLOUDINARY_NAME || 'dxwp8oppn',
    api_key: process.env.CLOUDINARY_API_KEY || '946281819691849',
    api_secret: process.env.CLOUDINARY_API_SECRET || '9BygPrL1ENxH1LrCwpoUONeOOk0',
  };

  console.log('☁️ Cloudinary initializing with config:', {
    cloud_name: config.cloud_name,
    api_key: config.api_key ? '***' : 'MISSING',
    api_secret: config.api_secret ? '***' : 'MISSING',
  });

  cloudinary.config(config);

  // Verify configuration
  if (!cloudinary.config().cloud_name) {
    console.error('❌ CRITICAL: Cloudinary cloud_name is not configured!');
    throw new Error('Cloudinary cloud_name is required');
  }

  if (!cloudinary.config().api_key) {
    console.error('❌ CRITICAL: Cloudinary api_key is not configured!');
    throw new Error('Cloudinary api_key is required');
  }

  console.log('✅ Cloudinary initialized successfully');
  return cloudinary;
}

// Export configured cloudinary instance
export { cloudinary };
