// src/notebooks/notebook.entity.ts - GÜNCELLENMİŞ
import { User } from 'src/auth/user.entity';
import { DevlogPage } from 'src/devlogs/devlog-page.entity';
import { 
  Column, 
  Entity, 
  PrimaryGeneratedColumn,
  ManyToOne, 
  CreateDateColumn, 
  UpdateDateColumn,
  ManyToMany,
  JoinTable 
} from 'typeorm';

@Entity({ name: 'notebooks' })
export class Notebook {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false })
  isDefault: boolean;

  @Column({ default: true })
  isPublic: boolean;

  @ManyToOne(() => User, (user) => user.notebooks, {
    onDelete: 'CASCADE'
  })
  user: User;

  @ManyToMany(() => DevlogPage, (devlogPage) => devlogPage.notebooks, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  @JoinTable({
    name: 'notebook_devlog_pages', 
    joinColumn: {
      name: 'notebook_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'devlog_page_id',
      referencedColumnName: 'id',
    },
  })
  devlogPages: DevlogPage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}