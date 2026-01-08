import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  ManyToOne, 
  JoinColumn, 
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { User } from '../auth/user.entity';
import { DevlogPage } from '../devlogs/devlog-page.entity';

export enum ComplaintReason {
  INAPPROPRIATE = 'inappropriate',
  SPAM = 'spam',
  COPYRIGHT = 'copyright',
  HARASSMENT = 'harassment',
  OTHER = 'other'
}

export enum ComplaintStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

@Entity({ name: 'complaints' })
export class Complaint {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ComplaintReason,
    default: ComplaintReason.OTHER
  })
  reason: ComplaintReason;

  @Column({ type: 'text' })
  description: string;

  @Column({
    type: 'enum',
    enum: ComplaintStatus,
    default: ComplaintStatus.PENDING
  })
  status: ComplaintStatus;

  @ManyToOne(() => User, (user) => user.complaints, { 
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => DevlogPage, (devlogPage) => devlogPage.complaints, { 
    onDelete: 'CASCADE'  // DEĞİŞTİRİLDİ: SET NULL yerine CASCADE
  })
  @JoinColumn({ name: 'devlog_page_id' })
  devlogPage: DevlogPage;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}