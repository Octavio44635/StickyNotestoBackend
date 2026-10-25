import { randomUUID } from 'node:crypto';
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { noteEntity } from '../entities/noteEntity.js';
import { JsonDb } from '../database/jsonDB.js';
import { CreateNoteDto } from './dto/CreateNoteDto.js';
import { UpdateNoteDto } from './dto/UpdateNoteDto.js';

@Injectable()
export class NotesService{
    constructor(private readonly db: JsonDb) {}

  async findAll(): Promise<noteEntity[]> {
    return (await this.db.read()).notes;
  }

  async create(dto: CreateNoteDto): Promise<noteEntity> {
    return this.db.update((notes) => {
      const newNote: noteEntity = { id: randomUUID(), ds: dto.ds };
      notes.notes.push(newNote);
      return newNote;
    });
}
  async findOne(id: string): Promise<noteEntity>{
    const data = await this.db.read()
    const nota = data.notes.find((item) => item.id === id);
    if (!nota) throw new NotFoundException('Nota no encontrada');
    return nota;        
  }

  async update(id: string, dto: UpdateNoteDto): Promise<noteEntity> {
  return this.db.update((data) => {
    const nota = data.notes.find((item) => item.id === id);
    if (!nota) throw new NotFoundException('Nota no encontrada');
    if (dto.ds !== undefined) {
      nota.ds = dto.ds;
    }
    return nota;
  });
}

  remove(id: string): Promise<{ mensaje: string; id: string }> {
    return this.db.update((data) => {
      const index = data.notes.findIndex((item) => item.id === id);
      if (index === -1) throw new NotFoundException('Nota no encontrada');
      data.notes.splice(index, 1);
      return { mensaje: 'Nota eliminada', id };
    });
  }
}