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
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Role } from '../auth/role.decorator';
import { ComplaintsService } from './complaints.service';
import { ComplaintReason, ComplaintStatus } from './complaint.entity';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  // Yeni şikayet oluştur
  @UseGuards(AuthGuard('jwt'))
  @Post()
  async createComplaint(
    @Body() body: { devlogPageId: number; reason: ComplaintReason; description: string },
    @Request() req,
  ) {
    return this.complaintsService.createComplaint(
      req.user.id,
      body.devlogPageId,
      body.reason,
      body.description,
    );
  }

  // Kullanıcının kendi şikayetleri
  @UseGuards(AuthGuard('jwt'))
  @Get('user/my-complaints')
  async getUserComplaints(@Request() req) {
    return this.complaintsService.getUserComplaints(req.user.id);
  }

  // Tüm şikayetler (sadece admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('admin')
  @Get()
  async getAllComplaints(@Query('status') status?: ComplaintStatus) {
    return this.complaintsService.getAllComplaints(status);
  }

  // Şikayet detayı
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('admin')
  @Get(':id')
  async getComplaint(@Param('id', ParseIntPipe) id: number) {
    return this.complaintsService.getComplaintById(id);
  }

  // Şikayet durumu güncelle (sadece admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('admin')
  @Put(':id')
  async updateComplaintStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: ComplaintStatus },
    @Request() req,
  ) {
    return this.complaintsService.updateComplaintStatus(
      id,
      body.status,
      req.user.id,
    );
  }

  // Şikayet sil (sadece admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('admin')
  @Delete(':id')
  async deleteComplaint(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.complaintsService.deleteComplaint(id, req.user.id);
  }

  // İstatistikler (sadece admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Role('admin')
  @Get('stats/overview')
  async getComplaintStats() {
    return this.complaintsService.getComplaintStats();
  }
}