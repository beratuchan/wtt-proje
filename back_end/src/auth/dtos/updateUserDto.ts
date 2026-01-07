// src/auth/dtos/updateUserDto.ts - BASİTLEŞTİRİLDİ
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Geçerli bir email adresi girin' })
  email?: string;

  @IsOptional()
  @IsString()
  photo?: string;
}