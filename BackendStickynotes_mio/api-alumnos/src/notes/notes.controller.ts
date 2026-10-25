import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { NotesService } from './notes.service.js';

import { CreateNoteDto } from './dto/CreateNoteDto.js';
import { UpdateNoteDto } from './dto/UpdateNoteDto.js';
// Tener en cuenta para la persistencia

@ApiTags('notes')
@Controller('notes')
export class NotesController{
    constructor (private readonly notesService: NotesService) {} //Contructor vacio

    //Y aca van los protocolos http
    //Eliminacion de nota, creacion de nota, actualizacion de nota y obtencion de notas o de una nota

    @Post()
    @ApiOperation({ summary: 'Crear una nueva nota' })
    @ApiResponse({ status: 201, description: 'Nota creada con éxito' })
    @ApiResponse({ status: 400, description: 'Datos inválidos' })
    create(@Body() dto: CreateNoteDto) {
        
        const nota = this.notesService.create(dto)
        console.log('nota creada')
        return nota;
        
        //Hay que crear el dto para guardar y levantar las notas de la base de datos
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todas las notas' })
    @ApiResponse({ status: 200, description: 'Lista de notas obtenida con éxito' })
    findAll(){
        return this.notesService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener una nota por ID' })
    @ApiParam({ name: 'id', description: 'Identificador único (UUID) de la nota' })
    @ApiResponse({ status: 200, description: 'Nota encontrada' })
    @ApiResponse({ status: 404, description: 'Nota no encontrada' })
    findOne(@Param ('id', ParseUUIDPipe) id: string){
        return this.notesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Actualizar una nota existente' })
    @ApiParam({ name: 'id', description: 'Identificador único (UUID) de la nota' })
    @ApiResponse({ status: 200, description: 'Nota actualizada con éxito' })
    @ApiResponse({ status: 404, description: 'Nota no encontrada' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNoteDto) {
        return this.notesService.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Eliminar una nota por ID' })
    @ApiParam({ name: 'id', description: 'Identificador único (UUID) de la nota' })
    @ApiResponse({ status: 200, description: 'Nota eliminada con éxito' })
    @ApiResponse({ status: 404, description: 'Nota no encontrada' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.notesService.remove(id);
    }
}