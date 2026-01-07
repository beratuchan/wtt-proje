// src/notebooks/notebooks.controller.ts - GÜNCELLENMİŞ
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
  ParseIntPipe,
  ValidationPipe,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NotebooksService } from './notebooks.service';
import { UpdateNotebookDto } from './update-notebook.dto';
import { CreateNotebookDto } from './create-notebook.dto';

@Controller('notebooks')
export class NotebooksController {
  private readonly logger = new Logger(NotebooksController.name);

  constructor(private readonly notebooksService: NotebooksService) {}

  // Tüm notebook'ları getir
  @UseGuards(AuthGuard('jwt'))
  @Get()
  async getUserNotebooks(@Request() req) {
    this.logger.log(`GET /notebooks for user: ${req.user.id}`);
    return this.notebooksService.getUserNotebooks(req.user.id);
  }

  // Tek notebook getir
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async getNotebook(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    this.logger.log(`GET /notebooks/${id} for user: ${req.user.id}`);
    return this.notebooksService.getNotebook(id, req.user.id);
  }

  // Notebook oluştur
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createNotebook(
    @Body(ValidationPipe) createNotebookDto: CreateNotebookDto,
    @Request() req,
  ) {
    this.logger.log(`POST /notebooks by user: ${req.user.id}`);
    this.logger.log(`Request body: ${JSON.stringify(createNotebookDto)}`);
    
    return this.notebooksService.createNotebook(createNotebookDto, req.user);
  }

  // Notebook güncelle
  @UseGuards(AuthGuard('jwt'))
  @Put(':id')
  async updateNotebook(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateNotebookDto: UpdateNotebookDto,
    @Request() req,
  ) {
    this.logger.log(`PUT /notebooks/${id} by user: ${req.user.id}`);
    return this.notebooksService.updateNotebook(id, updateNotebookDto, req.user);
  }

  // Notebook sil
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async deleteNotebook(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    this.logger.log(`DELETE /notebooks/${id} by user: ${req.user.id}`);
    return this.notebooksService.deleteNotebook(id, req.user);
  }

  // ✅ YENİ: Notebook'a devlog sayfası ekle
  @UseGuards(AuthGuard('jwt'))
  @Post(':notebookId/devlogs/:devlogId')
  async addDevlogToNotebook(
    @Param('notebookId', ParseIntPipe) notebookId: number,
    @Param('devlogId', ParseIntPipe) devlogId: number,
    @Request() req,
  ) {
    this.logger.log(`POST /notebooks/${notebookId}/devlogs/${devlogId} by user: ${req.user.id}`);
    return this.notebooksService.addDevlogToNotebook(notebookId, devlogId, req.user);
  }

  // ✅ YENİ: Notebook'dan devlog sayfası çıkar
  @UseGuards(AuthGuard('jwt'))
  @Delete(':notebookId/devlogs/:devlogId')
  async removeDevlogFromNotebook(
    @Param('notebookId', ParseIntPipe) notebookId: number,
    @Param('devlogId', ParseIntPipe) devlogId: number,
    @Request() req,
  ) {
    this.logger.log(`DELETE /notebooks/${notebookId}/devlogs/${devlogId} by user: ${req.user.id}`);
    return this.notebooksService.removeDevlogFromNotebook(notebookId, devlogId, req.user);
  }
}