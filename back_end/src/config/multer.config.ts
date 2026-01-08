import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import CloudinaryStorage from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { HttpException, HttpStatus } from '@nestjs/common';

// Cloudinary'yi konfigüre et
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_NAME || 'dxwp8oppn',
  api_key: process.env.CLOUDINARY_API_KEY || '946281819691849',
  api_secret: process.env.CLOUDINARY_API_SECRET || '9BygPrL1ENxH1LrCwpoUONeOOk0',
};

console.log('☁️ Cloudinary config:', {
  cloud_name: cloudinaryConfig.cloud_name,
  has_api_key: !!cloudinaryConfig.api_key,
  has_api_secret: !!cloudinaryConfig.api_secret,
});

cloudinary.config(cloudinaryConfig);

export const multerConfig: MulterOptions = {
  storage: new CloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'profile-photos',
    allowedFormats: ['jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'fill' }],
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new HttpException(
          `Dosya türü ${file.mimetype} desteklenmiyor. Sadece resim dosyaları (jpeg, png, gif, webp) yükleyebilirsiniz!`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
};