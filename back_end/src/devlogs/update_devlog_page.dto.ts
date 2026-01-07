// src/devlogs/dtos/update-devlog-page.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateDevlogPageDto } from './create-devlog-page.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDevlogPageDto extends PartialType(CreateDevlogPageDto) {
  @IsOptional()
  @IsString()
  content?: any; // JSON string veya array kabul et
}