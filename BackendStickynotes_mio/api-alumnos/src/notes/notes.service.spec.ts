import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { vi } from 'vitest';
import { NotesService } from './notes.service.js';
import { JsonDb, DatabaseFile } from '../database/jsonDB.js';
import { noteEntity } from '../entities/noteEntity.js';

describe('NotesService', () => {
  let service: NotesService;
  let mockDb: {
    read: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockDb = {
      read: vi.fn(),
      update: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotesService,
        {
          provide: JsonDb,
          useValue: mockDb,
        },
      ],
    }).compile();

    service = module.get<NotesService>(NotesService);
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('debe retornar todas las notas de la base de datos', async () => {
      const notasMock: noteEntity[] = [
        { id: '1', ds: 'Nota de prueba 1' },
        { id: '2', ds: 'Nota de prueba 2' },
      ];
      mockDb.read.mockResolvedValue({ notes: notasMock });

      const resultado = await service.findAll();
      expect(resultado).toEqual(notasMock);
      expect(mockDb.read).toHaveBeenCalledTimes(1);
    });
  });

  describe('create', () => {
    it('debe crear y retornar la nota guardada', async () => {
      mockDb.update.mockImplementation(async (callback: (db: DatabaseFile) => noteEntity) => {
        const fakeDb: DatabaseFile = { notes: [] };
        return callback(fakeDb);
      });

      const dto = { ds: 'Nueva nota' };
      const resultado = await service.create(dto);

      expect(resultado).toBeDefined();
      expect(resultado.id).toBeDefined();
      expect(resultado.ds).toBe('Nueva nota');
      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('debe retornar la nota correspondiente al id', async () => {
      const notaMock: noteEntity = { id: 'uuid-123', ds: 'Nota encontrada' };
      mockDb.read.mockResolvedValue({ notes: [notaMock] });

      const resultado = await service.findOne('uuid-123');
      expect(resultado).toEqual(notaMock);
    });

    it('debe lanzar NotFoundException si la nota no existe', async () => {
      mockDb.read.mockResolvedValue({ notes: [] });

      await expect(service.findOne('id-no-existente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar la descripción de la nota existente', async () => {
      const notaOriginal: noteEntity = { id: 'uuid-123', ds: 'Texto original' };
      mockDb.update.mockImplementation(async (callback: (db: DatabaseFile) => noteEntity) => {
        const fakeDb: DatabaseFile = { notes: [notaOriginal] };
        return callback(fakeDb);
      });

      const resultado = await service.update('uuid-123', { ds: 'Texto modificado' });
      expect(resultado.ds).toBe('Texto modificado');
      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar NotFoundException si se intenta actualizar una nota inexistente', async () => {
      mockDb.update.mockImplementation(async (callback: (db: DatabaseFile) => noteEntity) => {
        const fakeDb: DatabaseFile = { notes: [] };
        return callback(fakeDb);
      });

      await expect(
        service.update('id-no-existente', { ds: 'Nuevo texto' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('debe eliminar la nota existente y devolver confirmación', async () => {
      const nota: noteEntity = { id: 'uuid-123', ds: 'Nota a borrar' };
      mockDb.update.mockImplementation(async (callback: (db: DatabaseFile) => unknown) => {
        const fakeDb: DatabaseFile = { notes: [nota] };
        return callback(fakeDb);
      });

      const resultado = await service.remove('uuid-123');
      expect(resultado).toEqual({ mensaje: 'Nota eliminada', id: 'uuid-123' });
      expect(mockDb.update).toHaveBeenCalledTimes(1);
    });

    it('debe lanzar NotFoundException si la nota a eliminar no existe', async () => {
      mockDb.update.mockImplementation(async (callback: (db: DatabaseFile) => unknown) => {
        const fakeDb: DatabaseFile = { notes: [] };
        return callback(fakeDb);
      });

      await expect(service.remove('id-no-existente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});

