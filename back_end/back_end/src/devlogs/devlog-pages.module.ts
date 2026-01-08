// src/devlogs/devlog-pages.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DevlogPage } from './devlog-page.entity';
import { Notebook } from '../notebooks/notebook.entity'; // ✅ EKLEYİN
import { DevlogPagesController } from './devlog-page.controller';
import { DevlogPagesService } from './devlog-page.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DevlogPage, Notebook]), // ✅ Notebook'u ekleyin
  ],
  controllers: [DevlogPagesController],
  providers: [DevlogPagesService],
  exports: [DevlogPagesService],
})
export class DevlogPagesModule {}