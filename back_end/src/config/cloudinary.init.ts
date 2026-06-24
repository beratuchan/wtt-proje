import * as cloudinary from 'cloudinary';

// Cloudinary'yi merkezi olarak configure et
export function initializeCloudinary() {
  const config = {
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  };

  console.log('☁️ Cloudinary initializing with config:', {
    cloud_name: config.cloud_name,
    api_key: config.api_key ? '***' : 'MISSING',
    api_secret: config.api_secret ? '***' : 'MISSING',
  });

  cloudinary.v2.config(config);

  // Verify configuration
  if (!cloudinary.v2.config().cloud_name) {
    console.error('❌ CRITICAL: Cloudinary cloud_name is not configured!');
    throw new Error('Cloudinary cloud_name is required');
  }

  if (!cloudinary.v2.config().api_key) {
    console.error('❌ CRITICAL: Cloudinary api_key is not configured!');
    throw new Error('Cloudinary api_key is required');
  }

  console.log('✅ Cloudinary initialized successfully');
  return cloudinary;
}

// Export full cloudinary module (with v2 configured)
export { cloudinary };
