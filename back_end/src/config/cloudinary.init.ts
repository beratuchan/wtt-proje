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

  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    console.warn('⚠️  Cloudinary credentials not configured — file uploads will be unavailable');
    return cloudinary;
  }

  cloudinary.v2.config(config);
  console.log('✅ Cloudinary initialized successfully');
  return cloudinary;
}

// Export full cloudinary module (with v2 configured)
export { cloudinary };
