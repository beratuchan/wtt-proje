// src/auth/auth.service.ts - GÜNCELLENMİŞ deleteUser metodu
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterUserDto } from './dtos/registerUserDto';
import { LoginUserDto } from './dtos/loginUserDto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { Notebook } from '../notebooks/notebook.entity';
import { DevlogPage } from '../devlogs/devlog-page.entity';
import { Complaint } from '../complaint/complaint.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(Notebook) private notebooksRepository: Repository<Notebook>,
    @InjectRepository(DevlogPage) private devlogPagesRepository: Repository<DevlogPage>,
    @InjectRepository(Complaint) private complaintsRepository: Repository<Complaint>,
    private jwtService: JwtService,
  ) {}

  async validateUser(loginUser: LoginUserDto) {
    const user = await this.usersRepository.findOneBy({
      username: loginUser.username,
    });
    if (!user) return null;

    const ok = await bcrypt.compare(loginUser.password, user.password);
    return ok ? user : null;
  }

  async login(user: User) {
    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      email: user.email,
      photo: user.photo 
    };
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      photo: user.photo || '',
      accessToken: this.jwtService.sign(payload),
    };
  }

  async register(registerUser: RegisterUserDto) {
    const user = this.usersRepository.create(registerUser);
    user.password = bcrypt.hashSync(registerUser.password, 10);
    user.photo = registerUser.photo || '';
    
    const savedUser = await this.usersRepository.save(user);
    
    // Register'dan sonra login gibi token dön
    const payload = { 
      username: savedUser.username, 
      sub: savedUser.id, 
      role: savedUser.role,
      email: savedUser.email,
      photo: savedUser.photo 
    };
    
    return {
      id: savedUser.id,
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      photo: savedUser.photo || '',
      accessToken: this.jwtService.sign(payload),
    };
  }

  async getAllUsers() {
    const users = await this.usersRepository.find({
      order: { id: 'ASC' },\
      select: ['id', 'username', 'email', 'role', 'photo'],
    });
    return users.map(user => ({
      ...user,
      photo: user.photo || '',
    }));
  }

  // GÜNCELLENMİŞ deleteUser metodu - BASİTLEŞTİRİLDİ
  async deleteUser(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Transaction başlat
    const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      console.log(`🔄 Kullanıcı (ID: ${userId}) siliniyor...`);

      // 1. Önce kullanıcının şikayetlerini sil
      console.log('1️⃣ Kullanıcının şikayetleri siliniyor...');
      await queryRunner.manager.delete(Complaint, { user: { id: userId } });

      // 2. Kullanıcının devlog sayfalarına ait şikayetleri sil
      console.log('2️⃣ Kullanıcının devlog sayfalarına ait şikayetler siliniyor...');
      // Kullanıcının devlog sayfalarını al
      const userDevlogPages = await this.devlogPagesRepository.find({
        where: { author: { id: userId } },
        select: ['id']
      });
      
      if (userDevlogPages.length > 0) {
        const devlogPageIds = userDevlogPages.map(page => page.id);
        // Query Builder kullanarak şikayetleri sil
        await queryRunner.manager
          .createQueryBuilder()
          .delete()
          .from(Complaint)
          .where('devlog_page_id IN (:...ids)', { ids: devlogPageIds })
          .execute();
      }

      // 3. Many-to-many ilişkilerini temizle (notebook_devlog_pages tablosu)
      console.log('3️⃣ Many-to-many ilişkileri temizleniyor...');
      // Kullanıcının defterlerini al
      const userNotebooks = await this.notebooksRepository.find({
        where: { user: { id: userId } },
        select: ['id']
      });
      
      if (userNotebooks.length > 0) {
        const notebookIds = userNotebooks.map(notebook => notebook.id);
        await queryRunner.manager.query(
          `DELETE FROM notebook_devlog_pages WHERE notebook_id IN (${notebookIds.join(',')})`
        );
      }

      // 4. Kullanıcının devlog sayfalarını sil
      console.log('4️⃣ Kullanıcının devlog sayfaları siliniyor...');
      await queryRunner.manager.delete(DevlogPage, { author: { id: userId } });

      // 5. Kullanıcının defterlerini sil
      console.log('5️⃣ Kullanıcının defterleri siliniyor...');
      await queryRunner.manager.delete(Notebook, { user: { id: userId } });

      // 6. Son olarak kullanıcıyı sil
      console.log('6️⃣ Kullanıcı siliniyor...');
      await queryRunner.manager.delete(User, userId);

      await queryRunner.commitTransaction();
      console.log('✅ Kullanıcı başarıyla silindi');
      
      return { message: 'Kullanıcı başarıyla silindi' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('❌ Kullanıcı silme hatası:', error);
      throw new BadRequestException('Kullanıcı silinirken bir hata oluştu: ' + error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async updateUserRole(userId: number, role: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    user.role = role;
    return this.usersRepository.save(user);
  }

  // ✅ GÜNCELLENMİŞ: Profil güncelleme - BASİTLEŞTİRİLDİ
  async updateProfile(userId: number, updateData: any) {
    console.log('🟡 AUTH SERVICE: updateProfile başlıyor');
    console.log('🟡 userId:', userId);
    console.log('🟡 updateData:', updateData);
    
    const user = await this.usersRepository.findOneBy({ id: userId });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    console.log('🟡 Mevcut kullanıcı:', {
      id: user.id,
      username: user.username,
      email: user.email,
      photo: user.photo
    });

    // Sadece gönderilen alanları güncelle
    if (updateData.username !== undefined) {
      user.username = updateData.username;
      console.log('✅ Username güncellendi:', updateData.username);
    }
    
    if (updateData.email !== undefined) {
      user.email = updateData.email;
      console.log('✅ Email güncellendi:', updateData.email);
    }
    
    // ✅ FOTOĞRAF GÜNCELLEME - Cloudinary URL'lerini direkt sakla
    if (updateData.photo !== undefined) {
      console.log('🟡 Photo güncelleniyor:', updateData.photo);
      
      if (updateData.photo === '' || updateData.photo === null) {
        // Boş string veya null ise fotoğrafı kaldır
        user.photo = '';
        console.log('✅ Fotoğraf kaldırıldı');
      } else {
        // Cloudinary URL'yi (https://...) veya tam path'i direkt sakla
        // Eğer URL değilse (sadece filename), bu hata demektir
        user.photo = updateData.photo;
        console.log('✅ Fotoğraf URL saklandı:', updateData.photo);
      }
    }

    await this.usersRepository.save(user);
    console.log('✅ Kullanıcı kaydedildi');

    console.log('✅ Tam photo URL:', user.photo);

    // Yeni token oluştur
    const payload = { 
      username: user.username, 
      sub: user.id, 
      role: user.role,
      email: user.email,
      photo: user.photo
    };
    
    const newToken = this.jwtService.sign(payload);
    console.log('✅ Yeni token oluşturuldu');
    
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      photo: user.photo,
      accessToken: newToken,
    };
  }

  // Şifre değiştirme metodu
  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Mevcut şifre hatalı');
    }

    // Yeni şifreyi hashle
    user.password = bcrypt.hashSync(changePasswordDto.newPassword, 10);
    await this.usersRepository.save(user);

    return { message: 'Şifre başarıyla değiştirildi' };
  }
}