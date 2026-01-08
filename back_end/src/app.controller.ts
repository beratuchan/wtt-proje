import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // DEBUG: Cloudinary config kontrolü
  @Get('debug/cloudinary')
  checkCloudinary() {
    return {
      CLOUDINARY_NAME: process.env.CLOUDINARY_NAME || 'NOT SET',
      CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ? '✅ SET' : '❌ NOT SET',
      CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ? '✅ SET' : '❌ NOT SET',
      NODE_ENV: process.env.NODE_ENV,
      BACKEND_URL: process.env.BACKEND_URL,
    };
  }
}
