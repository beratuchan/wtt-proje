import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Complaint, ComplaintReason, ComplaintStatus } from './complaint.entity';
import { User } from '../auth/user.entity';
import { DevlogPage } from '../devlogs/devlog-page.entity';

@Injectable()
export class ComplaintsService {
  constructor(
    @InjectRepository(Complaint)
    private complaintsRepository: Repository<Complaint>,
    @InjectRepository(DevlogPage)
    private devlogPagesRepository: Repository<DevlogPage>,
  ) {}

  async createComplaint(
    userId: number,
    devlogPageId: number,
    reason: ComplaintReason,
    description: string,
  ): Promise<Complaint> {
    const devlogPage = await this.devlogPagesRepository.findOne({
      where: { id: devlogPageId },
    });

    if (!devlogPage) {
      throw new NotFoundException('Devlog sayfası bulunamadı');
    }

    const existingComplaint = await this.complaintsRepository.findOne({
      where: {
        user: { id: userId },
        devlogPage: { id: devlogPageId },
        status: ComplaintStatus.PENDING,
      },
    });

    if (existingComplaint) {
      throw new BadRequestException('Bu sayfa için zaten bekleyen bir şikayetiniz var');
    }

    const complaint = this.complaintsRepository.create({
      reason,
      description,
      status: ComplaintStatus.PENDING,
      user: { id: userId } as User,
      devlogPage: { id: devlogPageId } as DevlogPage,
    });

    return this.complaintsRepository.save(complaint);
  }

  async getUserComplaints(userId: number): Promise<Complaint[]> {
    return this.complaintsRepository.find({
      where: { user: { id: userId } },
      relations: ['devlogPage', 'devlogPage.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async getAllComplaints(status?: ComplaintStatus): Promise<Complaint[]> {
    const where = status ? { status } : {};
    
    return this.complaintsRepository.find({
      where,
      relations: ['user', 'devlogPage', 'devlogPage.author'],
      order: { createdAt: 'DESC' },
    });
  }

  async getComplaintById(id: number): Promise<Complaint> {
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
      relations: ['user', 'devlogPage', 'devlogPage.author'],
    });

    if (!complaint) {
      throw new NotFoundException('Şikayet bulunamadı');
    }

    return complaint;
  }

async updateComplaintStatus(
  id: number,
  status: ComplaintStatus,
  adminId: number,
): Promise<Complaint> {
  const complaint = await this.complaintsRepository.findOne({
    where: { id },
    relations: ['devlogPage'],
  });

  if (!complaint) {
    throw new NotFoundException('Şikayet bulunamadı');
  }

  // Eğer resolved ise ve sayfa varsa, sayfayı SİL
  if (status === ComplaintStatus.RESOLVED && complaint.devlogPage) {
    await this.devlogPagesRepository.delete(complaint.devlogPage.id);
  }

  // Eğer rejected ise, sayfayla ilgili bir işlem yapma, sadece şikayet durumunu güncelle

  complaint.status = status;
  return this.complaintsRepository.save(complaint);
}

  async deleteComplaint(id: number, adminId: number): Promise<void> {
    const complaint = await this.complaintsRepository.findOne({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException('Şikayet bulunamadı');
    }

    await this.complaintsRepository.remove(complaint);
  }

  async getComplaintStats(): Promise<any> {
    const stats = await this.complaintsRepository
      .createQueryBuilder('complaint')
      .select('complaint.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('complaint.status')
      .getRawMany();

    const total = await this.complaintsRepository.count();
    
    return {
      total,
      stats: stats.reduce((acc, curr) => {
        acc[curr.status] = parseInt(curr.count);
        return acc;
      }, {}),
    };
  }
}