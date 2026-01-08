import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';

export const multerDevlogConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads/devlog-images',
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      const filename = `${uniqueSuffix}${ext}`;
      callback(null, filename);
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, callback) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    
    if (allowedMimes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new HttpException(
          `Dosya türü ${file.mimetype} desteklenmiyor. Sadece resim dosyaları (jpeg, png, gif, webp, svg) yükleyebilirsiniz!`,
          HttpStatus.BAD_REQUEST,
        ),
        false,
      );
    }
  },
};