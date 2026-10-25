import { PartialType } from '@nestjs/swagger';
import {CreateNoteDto } from './CreateNoteDto.js';

export class UpdateNoteDto extends PartialType(CreateNoteDto) {}