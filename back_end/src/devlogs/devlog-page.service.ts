import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DevlogPage } from './devlog-page.entity';
import { User } from '../auth/user.entity';
import { Notebook } from '../notebooks/notebook.entity';
import { CreateDevlogPageDto } from './create-devlog-page.dto';
import { UpdateDevlogPageDto } from './update_devlog_page.dto';

@Injectable()
export class DevlogPagesService {
  constructor(
    @InjectRepository(DevlogPage)
    private devlogPagesRepository: Repository<DevlogPage>,
    @InjectRepository(Notebook)
    private notebooksRepository: Repository<Notebook>,
  ) {}

  // CREATE
  async create(createDevlogPageDto: CreateDevlogPageDto, user: User) {
    console.log('🟡 Creating devlog page for user:', user.id);
    
    let originalNotebook: Notebook | null = null;
    
    if (createDevlogPageDto.originalNotebookId) {
      originalNotebook = await this.notebooksRepository.findOne({
        where: { 
          id: createDevlogPageDto.originalNotebookId, 
          user: { id: user.id } 
        }
      }) as Notebook;
      
      if (!originalNotebook) {
        throw new ForbiddenException('Bu defteri kullanma yetkiniz yok');
      }
    }

    const devlogPage = this.devlogPagesRepository.create({
      title: createDevlogPageDto.title,
      content: JSON.stringify(createDevlogPageDto.content),
      coverImage: createDevlogPageDto.coverImage || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
      isPublished: createDevlogPageDto.isPublished ?? true,
      author: user,
      originalNotebook: originalNotebook as any,
      viewCount: 0,
      likeCount: 0,
    });

    const savedPage = await this.devlogPagesRepository.save(devlogPage);
    console.log('✅ Devlog page created:', savedPage.id);
    
    return savedPage;
  }

// src/devlogs/devlog-page.service.ts - GÜNCELLENMİŞ
async findAll(user?: User) {
  console.log('🟡 findAll called with user:', user?.id);
  
  // ✅ DEĞİŞTİRİLDİ: user varsa sadece o kullanıcının devloglarını getir
  const where: any = {};
  
  if (user) {
    where.author = { id: user.id };
    console.log('✅ Filtering by user ID:', user.id);
  } else {
    where.isPublished = true;
    console.log('✅ Getting all published devlogs');
  }
  
  return this.devlogPagesRepository.find({
    where,
    relations: ['author', 'originalNotebook'],
    order: { createdAt: 'DESC' },
  });
}

  // READ - Tek sayfa
  async findOne(id: number, user?: User) {
    const page = await this.devlogPagesRepository.findOne({
      where: { id },
      relations: ['author', 'originalNotebook'],
    });

    if (!page) {
      throw new NotFoundException('Devlog sayfası bulunamadı');
    }

    // Erişim kontrolü: Yazar veya public sayfa
    if (page.author.id !== user?.id && !page.isPublished) {
      throw new ForbiddenException('Bu sayfaya erişim izniniz yok');
    }

    // Görüntüleme sayısını artır
    page.viewCount += 1;
    await this.devlogPagesRepository.save(page);

    return page;
  }

  // UPDATE - GÜNCELLENMİŞ VERSİYON
  async update(id: number, updateData: UpdateDevlogPageDto, user: User) {
    const page = await this.devlogPagesRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!page) {
      throw new NotFoundException('Devlog sayfası bulunamadı');
    }

    // Admin veya yazar güncelleyebilir
    if (user.role !== 'admin' && page.author.id !== user.id) {
      throw new ForbiddenException('Bu sayfayı güncelleme yetkiniz yok');
    }

    // JSON string'e çevir
    if (updateData.content && Array.isArray(updateData.content)) {
      page.content = JSON.stringify(updateData.content);
    }

    // Diğer alanları güncelle
    if (updateData.title !== undefined) page.title = updateData.title;
    if (updateData.coverImage !== undefined) page.coverImage = updateData.coverImage;
    if (updateData.isPublished !== undefined) page.isPublished = updateData.isPublished;
    
    return this.devlogPagesRepository.save(page);
  }

  // DELETE - GÜNCELLENMİŞ VERSİYON
  async remove(id: number, user: User) {
    const page = await this.devlogPagesRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!page) {
      throw new NotFoundException('Devlog sayfası bulunamadı');
    }

    // Admin veya yazar silebilir
    if (user.role !== 'admin' && page.author.id !== user.id) {
      throw new ForbiddenException('Bu sayfayı silme yetkiniz yok');
    }

    await this.devlogPagesRepository.remove(page);
    return { message: 'Sayfa başarıyla silindi' };
  }

  // YENİ METOD: Admin için sayfayı gizle
  async hidePage(id: number, user: User) {
    const page = await this.devlogPagesRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!page) {
      throw new NotFoundException('Devlog sayfası bulunamadı');
    }

    // Admin veya yazar gizleyebilir
    if (user.role !== 'admin' && page.author.id !== user.id) {
      throw new ForbiddenException('Bu sayfayı gizleme yetkiniz yok');
    }

    page.isPublished = false;
    return this.devlogPagesRepository.save(page);
  }

  // LIKE
  async likePage(id: number, user: User) {
    const page = await this.devlogPagesRepository.findOne({
      where: { id },
    });

    if (!page) {
      throw new NotFoundException('Devlog sayfası bulunamadı');
    }

    // Kullanıcı sadece public sayfaları beğenebilir veya kendi sayfasını
    if (page.author.id !== user.id && !page.isPublished) {
      throw new ForbiddenException('Bu sayfayı beğenemezsiniz');
    }

    page.likeCount += 1;
    return this.devlogPagesRepository.save(page);
  }

  // Kullanıcının tüm sayfaları
  async findByUser(userId: number) {
    return this.devlogPagesRepository.find({
      where: { author: { id: userId } },
      relations: ['author', 'originalNotebook'],
      order: { createdAt: 'DESC' },
    });
  }

  // Public sayfalar
  async findPublic() {
    return this.devlogPagesRepository.find({
      where: { isPublished: true },
      relations: ['author', 'originalNotebook'],
      order: { createdAt: 'DESC' },
    });
  }
}