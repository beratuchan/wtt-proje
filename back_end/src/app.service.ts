import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  checkCloudinary() {
    console.log('🔍 Cloudinary config kontrol:');
    console.log('  CLOUDINARY_NAME:', process.env.CLOUDINARY_NAME || '❌ NOT SET');
    console.log('  CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET');
    console.log('  CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET');
    
    return {
      CLOUDINARY_NAME: process.env.CLOUDINARY_NAME || 'NOT SET',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      BACKEND_URL: process.env.BACKEND_URL,
      timestamp: new Date().toISOString(),
    };
  }
}
