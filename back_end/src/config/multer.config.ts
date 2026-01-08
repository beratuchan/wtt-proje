import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import CloudinaryStorage from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { HttpException, HttpStatus } from '@nestjs/common';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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