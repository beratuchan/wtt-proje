// src/notebooks/notebooks.service.ts - GÜNCELLENMİŞ
import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notebook } from './notebook.entity';
import { User } from '../auth/user.entity';
import { DevlogPage } from '../devlogs/devlog-page.entity'; // ✅ Import ekleyin
import { CreateNotebookDto } from './create-notebook.dto';
import { UpdateNotebookDto } from './update-notebook.dto';

@Injectable()
export class NotebooksService {
  constructor(
    @InjectRepository(Notebook)
    private notebooksRepository: Repository<Notebook>,
    @InjectRepository(DevlogPage) // ✅ DevlogPage repository'sini ekleyin
    private devlogPagesRepository: Repository<DevlogPage>,
  ) {}

  // CREATE
  async createNotebook(createNotebookDto: CreateNotebookDto, user: User) {
    console.log('🟡 Creating notebook for user:', user.id);
    
    const notebook = this.notebooksRepository.create({
      ...createNotebookDto,
      user,
    });

    const saved = await this.notebooksRepository.save(notebook);
    console.log('✅ Notebook created:', saved);
    return saved;
  }

  // READ - Tüm notebook'lar
  async getUserNotebooks(userId: number) {
    return this.notebooksRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'devlogPages'], // ✅ devlogPages ilişkisini ekleyin
      order: { 
        createdAt: 'DESC' 
      },
    });
  }

  // READ - Tek notebook
  async getNotebook(id: number, userId: number) {
    console.log('🟡 Getting notebook:', { id, userId });
    
    const notebook = await this.notebooksRepository.findOne({
      where: { id },
      relations: ['user', 'devlogPages', 'devlogPages.author'], // ✅ devlogPages ve author'ı ekleyin
    });

    if (!notebook) {
      throw new NotFoundException('Defter bulunamadı');
    }

    // Erişim kontrolü: Sahip veya public defter
    if (notebook.user.id !== userId && !notebook.isPublic) {
      throw new ForbiddenException('Bu deftere erişim izniniz yok');
    }

    return notebook;
  }

  // UPDATE
  async updateNotebook(id: number, updateNotebookDto: UpdateNotebookDto, user: User) {
    console.log('🟡 Updating notebook:', { id, userId: user.id, data: updateNotebookDto });
    
    const notebook = await this.notebooksRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!notebook) {
      throw new NotFoundException('Defter bulunamadı veya erişim izniniz yok');
    }

    // Varsayılan defter kontrolü
    if (updateNotebookDto.isDefault && !notebook.isDefault) {
      await this.clearUserDefaults(user.id);
    }

    Object.assign(notebook, updateNotebookDto);
    return this.notebooksRepository.save(notebook);
  }

  // DELETE
  async deleteNotebook(id: number, user: User) {
    console.log('🟡 Deleting notebook:', { id, userId: user.id });
    
    const notebook = await this.notebooksRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!notebook) {
      throw new NotFoundException('Defter bulunamadı veya erişim izniniz yok');
    }

    // Varsayılan defteri silemez
    if (notebook.isDefault) {
      throw new ForbiddenException('Varsayılan defter silinemez');
    }

    await this.notebooksRepository.remove(notebook);
    return { message: 'Defter başarıyla silindi' };
  }

  // ✅ YENİ: Notebook'a devlog sayfası ekle
  async addDevlogToNotebook(notebookId: number, devlogId: number, user: User) {
    console.log('🟡 Adding devlog to notebook:', { notebookId, devlogId, userId: user.id });
    
    // Notebook'u bul
    const notebook = await this.notebooksRepository.findOne({
      where: { id: notebookId, user: { id: user.id } },
      relations: ['devlogPages'],
    });

    if (!notebook) {
      throw new NotFoundException('Defter bulunamadı veya erişim izniniz yok');
    }

    // Devlog sayfasını bul
    const devlogPage = await this.devlogPagesRepository.findOne({
      where: { id: devlogId },
      relations: ['author'],
    });

    if (!devlogPage) {
      throw new NotFoundException('Devlog sayfası bulunamadı');
    }

    // Erişim kontrolü: Kullanıcı kendi sayfasını her zaman, başkasının published sayfasını ekleyebilir
    if (devlogPage.author.id !== user.id && !devlogPage.isPublished) {
      throw new ForbiddenException('Sadece kendi sayfalarınızı veya yayınlanmış sayfaları deftere ekleyebilirsiniz');
    }

    // Zaten ekli mi kontrol et
    const alreadyAdded = notebook.devlogPages?.some(page => page.id === devlogId);
    if (alreadyAdded) {
      throw new BadRequestException('Bu sayfa zaten defterde mevcut');
    }

    // Eğer devlogPages null ise, boş array oluştur
    if (!notebook.devlogPages) {
      notebook.devlogPages = [];
    }

    // Devlog'u ekle
    notebook.devlogPages.push(devlogPage);
    await this.notebooksRepository.save(notebook);

    return { message: 'Sayfa deftere başarıyla eklendi' };
  }

  // ✅ YENİ: Notebook'dan devlog sayfası çıkar
  async removeDevlogFromNotebook(notebookId: number, devlogId: number, user: User) {
    console.log('🟡 Removing devlog from notebook:', { notebookId, devlogId, userId: user.id });
    
    // Notebook'u bul
    const notebook = await this.notebooksRepository.findOne({
      where: { id: notebookId, user: { id: user.id } },
      relations: ['devlogPages'],
    });

    if (!notebook) {
      throw new NotFoundException('Defter bulunamadı veya erişim izniniz yok');
    }

    // Eğer devlogPages null veya boşsa
    if (!notebook.devlogPages || notebook.devlogPages.length === 0) {
      throw new NotFoundException('Defterde sayfa bulunamadı');
    }

    // Sayfayı filtrele
    const initialLength = notebook.devlogPages.length;
    notebook.devlogPages = notebook.devlogPages.filter(page => page.id !== devlogId);
    
    // Eğer uzunluk değişmediyse, sayfa defterde yok demektir
    if (notebook.devlogPages.length === initialLength) {
      throw new NotFoundException('Bu sayfa defterde bulunamadı');
    }

    await this.notebooksRepository.save(notebook);
    return { message: 'Sayfa defterden başarıyla çıkarıldı' };
  }

  // Yardımcı metod
  private async clearUserDefaults(userId: number) {
    await this.notebooksRepository.update(
      { user: { id: userId }, isDefault: true },
      { isDefault: false }
    );
  }
}