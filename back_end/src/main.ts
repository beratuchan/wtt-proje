import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: 'http://localhost:5173',
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
  
  await app.listen(3000);
  console.log(`🚀 Backend çalışıyor: http://localhost:3000`);
  console.log(`🖼️  Devlog görselleri: http://localhost:3000/uploads/devlog-images/`);
  console.log(`👤 Profil fotoğrafları: http://localhost:3000/uploads/profile-photos/`);
}
bootstrap();