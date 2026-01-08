// src/devlogs/dtos/create-devlog-page.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

class DevlogBlockDto {
  @IsNotEmpty()
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  level?: number;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  src?: string;

  @IsOptional()
  @IsString()
  alt?: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @IsString()
  author?: string;
}

export class CreateDevlogPageDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => DevlogBlockDto)
  content: DevlogBlockDto[];

  @IsOptional()
  @IsString()
  coverImage?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsInt()
  originalNotebookId?: number;
}