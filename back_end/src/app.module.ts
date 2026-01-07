import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { NotebooksModule } from './notebooks/notebooks.module';
import { DevlogPagesModule } from './devlogs/devlog-pages.module';


// Entity'leri import edin
import { User } from './auth/user.entity';
import { Notebook } from './notebooks/notebook.entity';
import { DevlogPage } from './devlogs/devlog-page.entity';
import { ComplaintsModule } from './complaint/complaints.module';
import { Complaint } from './complaint/complaint.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '',
      database: 'lesson2v2',
      entities: [User, Notebook, DevlogPage, Complaint], // Complaint'i ekleyin
      synchronize: true,
      extra: {
        client_encoding: 'utf8'
      }
    }),
    AuthModule,
    NotebooksModule,
    DevlogPagesModule,
    ComplaintsModule, // YENİ modülü ekleyin
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}