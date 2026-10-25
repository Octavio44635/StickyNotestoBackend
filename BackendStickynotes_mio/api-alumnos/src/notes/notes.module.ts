import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/databaseModule.js';
import { NotesController } from './notes.controller.js';
import { NotesService } from './notes.service.js';


@Module({
  imports: [DatabaseModule], //Ni idea todavia
  controllers: [NotesController],
  providers: [NotesService],
})
export class NotesModule {}
