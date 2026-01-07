
// src/auth/dtos/change-password.dto.ts - Yeni DTO
import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator';
import { Match } from 'src/decorators/match.decorator';


export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Mevcut şifre gereklidir' })
  currentPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Yeni şifre gereklidir' })
  @MinLength(6, { message: 'Yeni şifre en az 6 karakter olmalıdır' })
  newPassword: string;

  @IsString()
  @IsNotEmpty({ message: 'Yeni şifre tekrarı gereklidir' })
  @Match('newPassword', { message: 'Yeni şifreler eşleşmiyor' })
  confirmNewPassword: string;
}

