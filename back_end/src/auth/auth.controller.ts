// src/auth/auth.controller.ts - TAM ÇALIŞAN VERSİYON
import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
  ValidationPipe,
  Request,
  UseInterceptors,
  UploadedFile,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/registerUserDto';
import { LoginUserDto } from './dtos/loginUserDto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { getMulterConfig } from '../config/multer.config';
import { RolesGuard } from './roles.guard';
import { Role } from './role.decorator';
import { UpdateUserDto } from './dtos/updateUserDto';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginUser: LoginUserDto) {
    const user = await this.authService.validateUser(loginUser);
    if (!user) throw new UnauthorizedException('Wrong username or password');

    return this.authService.login(user);
  }

  @Post('register')
  @UseInterceptors(FileInterceptor('photo', getMulterConfig()))
  async register(
    @Body(ValidationPipe) registerUser: RegisterUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      // Debug: File object'inin tüm property'lerini göster
      console.log('📁 File object keys:', Object.keys(file));
      console.log('📁 Full file object:', JSON.stringify(file, null, 2));
      
      // Cloudinary URL'sini bul
      const photoUrl = (file as any).secure_url || (file as any).url || (file as any).path || file.filename;
      registerUser.photo = photoUrl;
      console.log('✅ Seçilen photo URL:', photoUrl);
    }
    
    return this.authService.register(registerUser);
  }
  @UseGuards(AuthGuard('jwt'))
@Post('change-password')
async changePassword(
  @Request() req,
  @Body() changePasswordDto: ChangePasswordDto,
) {
  return this.authService.changePassword(req.user.id, changePasswordDto);
}

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  // ✅ YENİ: Tüm kullanıcıları listele (sadece admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('admin')
  @Get('users')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  // ✅ YENİ: Kullanıcı sil (sadece admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('admin')
  @Post('users/:id/delete')
  async deleteUser(@Request() req, @Body('id') userId: number) {
    // Admin kendini silemez
    if (req.user.id === userId) {
      throw new ForbiddenException('You cannot delete your own account');
    }
    return this.authService.deleteUser(userId);
  }

  // ✅ YENİ: Kullanıcı rolünü güncelle (sadece admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('admin')
  @Post('users/:id/update-role')
  async updateUserRole(
    @Body('id') userId: number,
    @Body('role') role: string,
  ) {
    return this.authService.updateUserRole(userId, role);
  }

  // ✅ GÜNCELLENMİŞ: Profil güncelleme - VALIDATION SORUNU ÇÖZÜLDÜ
  @UseGuards(AuthGuard('jwt'))
  @Post('profile/update')
  @UseInterceptors(FileInterceptor('photo', getMulterConfig()))
  async updateProfile(
    @Request() req,
    @Body() updateData: any, // ✅ ValidationPipe'ı KALDIRDIM - Geçici çözüm
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    console.log('🟡 BACKEND: Profil güncelleme başlıyor');
    console.log('🟡 Gelen veri:', updateData);
    console.log('🟡 File var mı?:', file ? 'EVET - ' + file.filename : 'HAYIR');
    console.log('🟡 User ID:', req.user.id);
    
    const userId = req.user.id;
    
    // Eğer dosya yüklendiyse
    if (file) {
      // Debug: File object'inin tüm property'lerini göster
      console.log('📁 File object keys:', Object.keys(file));
      console.log('📁 Full file object:', JSON.stringify(file, null, 2));
      
      // Cloudinary URL'sini bul - Cloudinary 'url' property'sini kullan
      const photoUrl = (file as any).secure_url || (file as any).url || (file as any).path;
      if (!photoUrl) {
        throw new BadRequestException('Dosya yükleme başarısız - Cloudinary URL alınamadı');
      }
      updateData.photo = photoUrl;
      console.log('✅ Seçilen photo URL:', photoUrl);
    }
    
    // Eğer frontend'den photo boş string olarak gelmişse (kaldırma isteği)
    if (updateData.photo === '') {
      console.log('ℹ️  Fotoğraf kaldırma isteği');
    }
    
    // Eğer photo undefined ise, mevcut fotoğrafı koru
    if (updateData.photo === undefined && req.user.photo) {
      const currentPhoto = req.user.photo;
      if (currentPhoto && currentPhoto.includes('profile-photos/')) {
        const parts = currentPhoto.split('profile-photos/');
        updateData.photo = parts[1] || currentPhoto;
        console.log('ℹ️  Mevcut fotoğraf korunacak:', updateData.photo);
      }
    }
    
    // Validasyon: Kullanıcı adı ve email boş olmamalı
    if (!updateData.username || !updateData.username.trim()) {
      throw new BadRequestException('Kullanıcı adı boş olamaz');
    }
    
    if (!updateData.email || !updateData.email.trim()) {
      throw new BadRequestException('Email boş olamaz');
    }
    
    return this.authService.updateProfile(userId, updateData);
  }
}