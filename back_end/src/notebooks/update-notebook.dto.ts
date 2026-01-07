// src/notebooks/dtos/update-notebook.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateNotebookDto } from './create-notebook.dto';

export class UpdateNotebookDto extends PartialType(CreateNotebookDto) {}