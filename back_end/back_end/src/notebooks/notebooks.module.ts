// src/notebooks/notebooks.module.ts - GÜNCELLENMİŞ
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotebooksController } from './notebooks.controller';
import { NotebooksService } from './notebooks.service';
import { Notebook } from './notebook.entity';
import { DevlogPage } from '../devlogs/devlog-page.entity'; // ✅ Import ekleyin
import { User } from '../auth/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notebook, DevlogPage, User]), // ✅ DevlogPage'i ekleyin
  ],
  controllers: [NotebooksController],
  providers: [NotebooksService],
  exports: [NotebooksService],
})
export class NotebooksModule {}