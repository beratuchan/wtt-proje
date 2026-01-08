import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.decorator';
import { DevlogPagesService } from './devlog-page.service';
import { CreateDevlogPageDto } from './create-devlog-page.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { getMulterDevlogConfig } from '../config/multer-devlog.config';

@Controller('devlogs')
export class DevlogPagesController {
  constructor(private readonly devlogPagesService: DevlogPagesService) {}

 @UseGuards(AuthGuard('jwt'))
  @Get()
  async findAll(@Request() req, @Query('mine') mine?: string) {
    console.log('🟡 GET /devlogs called, mine:', mine, 'user:', req.user?.id);
    
    // Eğer mine=true ise, sadece kullanıcının kendi devloglarını getir (published/unpublished)
    if (mine === 'true') {
      console.log('✅ Getting user\'s own devlogs for user ID:', req.user.id);
      return this.devlogPagesService.findAll(req.user);
    }
    
    // Değilse, tüm public devlogları getir (başkalarının published'ları + kendi tümü)
    console.log('✅ Getting all public devlogs');
    const allDevlogs = await this.devlogPagesService.findAll();
    
    // Kendi devlog'larını ekle (published/unpublished hepsi)
    if (req.user) {
      const userDevlogs = await this.devlogPagesService.findAll(req.user);
      const otherPublishedDevlogs = allDevlogs.filter(devlog => 
        devlog.author?.id !== req.user.id && devlog.isPublished
      );
      const combined = [...userDevlogs, ...otherPublishedDevlogs];
      console.log(`✅ Returning ${combined.length} devlogs (user's own: ${userDevlogs.length} + others' published: ${otherPublishedDevlogs.length})`);
      return combined;
    }
    
    // Giriş yapmamış kullanıcı için tüm public devlogları döndür
    return allDevlogs;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.devlogPagesService.findOne(parseInt(id));
  }

  @UseGuards(AuthGuard('jwt'))
  @Post()
  async create(@Body() createDevlogPageDto: CreateDevlogPageDto, @Request() req) {
    return this.devlogPagesService.create(createDevlogPageDto, req.user);
  }


  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateData: any,
    @Request() req,
  ) {
    return this.devlogPagesService.update(id, updateData, req.user);
  }

    // YENİ: Görsel yükleme endpoint'i
  @UseGuards(AuthGuard('jwt'))
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image', getMulterDevlogConfig()))
  async uploadImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Lütfen bir resim dosyası yükleyin');
    }
    
    // Cloudinary kullanıldığında secure_url döndürülür
    const imageUrl = file.secure_url || `/uploads/devlog-images/${file.filename}`;
    return { 
      success: true,
      url: imageUrl,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    };
  }

  // YENİ: Cover görsel yükleme endpoint'i
  @UseGuards(AuthGuard('jwt'))
  @Post('upload-cover')
  @UseInterceptors(FileInterceptor('cover', getMulterDevlogConfig()))
  async uploadCoverImage(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('Lütfen bir kapak resmi yükleyin');
    }
    
    // Cloudinary kullanıldığında secure_url döndürülür
    const imageUrl = file.secure_url || `/uploads/devlog-images/${file.filename}`;
    return { 
      success: true,
      url: imageUrl,
      filename: file.filename,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size
    };
  }
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.devlogPagesService.remove(id, req.user);
  }

  // YENİ: Admin ve yazar için sayfayı gizle endpoint'i
  @UseGuards(AuthGuard('jwt'))
  @Post(':id/hide')
  async hidePage(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.devlogPagesService.hidePage(id, req.user);
  }

  // YENİ: Admin için sayfa istatistikleri
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('admin')
  @Get('admin/stats')
  async getAdminStats() {
    // Burada admin için özel istatistikler dönebilirsiniz
    return { message: 'Admin istatistikleri' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/like')
  async like(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.devlogPagesService.likePage(id, req.user);
  }
}