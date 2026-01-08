import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { User } from './user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtStrategy } from './jwt.strategy';
import { Notebook } from '../notebooks/notebook.entity';
import { DevlogPage } from '../devlogs/devlog-page.entity';
import { Complaint } from '../complaint/complaint.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Notebook, DevlogPage, Complaint]),
    PassportModule, // authentication ve authorization işlemlerini yapan modül
    JwtModule.register({
      // token üretirken kullanılacak modül ve konfigürasyonlar
      secret: 'SECRET_KEY',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], //JwtStrategy burda eklenir ve projeye gelen her istekte çalışabilir.
})
export class AuthModule {}