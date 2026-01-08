import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',');
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  
  // ✅ Tüm upload klasörlerini statik dosya olarak sun
  const uploadsPath = join(__dirname, '..', 'uploads');
  const devlogImagesPath = join(__dirname, '..', 'uploads', 'devlog-images');
  const profilePhotosPath = join(__dirname, '..', 'uploads', 'profile-photos');
  
  console.log('📁 Statik dosya yolları:');
  console.log('   - Ana uploads:', uploadsPath);
  console.log('   - Devlog images:', devlogImagesPath);
  console.log('   - Profile photos:', profilePhotosPath);
  
  // Tüm uploads klasörünü statik dosya olarak sun
  app.use('/uploads', express.static(uploadsPath));
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Backend çalışıyor: ${process.env.BACKEND_URL || `http://localhost:${port}`}`);
  console.log(`🖼️  Devlog görselleri: http://localhost:3000/uploads/devlog-images/`);
  console.log(`👤 Profil fotoğrafları: http://localhost:3000/uploads/profile-photos/`);
}
bootstrap();