import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import CloudinaryStorage from 'multer-storage-cloudinary';
import { cloudinary } from './cloudinary.init';
import { HttpException, HttpStatus } from '@nestjs/common';

export function getMulterConfig(): MulterOptions {
  // Use the initialized cloudinary instance from cloudinary.init
  // No need to config again - it's already done in main.ts

  return {
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
}

// Geriye uyumluluk için
export const multerConfig = getMulterConfig();