import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplaintsController } from './complaints.controller';
import { ComplaintsService } from './complaints.service';
import { Complaint } from './complaint.entity';
import { DevlogPage } from '../devlogs/devlog-page.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Complaint, DevlogPage]),
  ],
  controllers: [ComplaintsController],
  providers: [ComplaintsService],
  exports: [ComplaintsService],
})
export class ComplaintsModule {}