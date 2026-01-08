import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn,
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn, 
  JoinColumn,
  ManyToMany,
  OneToMany 
} from 'typeorm';
import { User } from '../auth/user.entity';
import { Notebook } from '../notebooks/notebook.entity';
import { Complaint } from 'src/complaint/complaint.entity';

@Entity({ name: 'devlog_pages' })
export class DevlogPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string; // JSON string olarak saklanacak

  @Column()
  coverImage: string;

  @Column({ default: 0 })
  viewCount: number;

  @Column({ default: 0 })
  likeCount: number;

  @Column({ default: true })
  isPublished: boolean;

  @ManyToOne(() => User, (user) => user.devlogPages, {
    onDelete: 'CASCADE'
  })
  @JoinColumn({ name: 'author_id' })
  author: User;

  @ManyToOne(() => Notebook, { nullable: true })
  @JoinColumn({ name: 'original_notebook_id' })
  originalNotebook: Notebook | null;

  @ManyToMany(() => Notebook, (notebook) => notebook.devlogPages)
  notebooks: Notebook[];

  @OneToMany(() => Complaint, (complaint) => complaint.devlogPage, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  complaints: Complaint[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}