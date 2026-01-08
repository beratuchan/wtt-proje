import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Notebook } from 'src/notebooks/notebook.entity';
import { DevlogPage } from 'src/devlogs/devlog-page.entity';
import { Complaint } from 'src/complaint/complaint.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  role: string;

  @Column()
  email: string;
  
  @Column({ default: '' })
  photo: string;

  // İlişkiler
  @OneToMany(() => Notebook, (notebook) => notebook.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  notebooks: Notebook[];

  @OneToMany(() => DevlogPage, (devlogPage) => devlogPage.author, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  devlogPages: DevlogPage[];

  @OneToMany(() => Complaint, (complaint) => complaint.user, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  complaints: Complaint[];
}