// src/categories/categories.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { DATABASE } from '../db/db.module';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockDb: any;
  let whereChain: any;

  beforeEach(async () => {
    // whereChain supports both: await db...where() and db...where().orderBy()/.returning()
    whereChain = {
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockResolvedValue([]),
      returning: jest.fn().mockResolvedValue([]),
      then: jest.fn((resolve, _reject) => resolve([])),
    };

    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([]),
      where: jest.fn().mockReturnValue(whereChain),
      limit: jest.fn().mockReturnThis(),
      offset: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, { provide: DATABASE, useValue: mockDb }],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  describe('findAll', () => {
    it('returns paginated response with empty data', async () => {
      whereChain.then.mockImplementation((resolve: any) => resolve([{ total: 0 }]));
      whereChain.offset.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(0);
    });

    it('returns paginated response with data', async () => {
      const category = { id: 'uuid-1', name: 'cry place', emoji: null, deletedAt: null, createdAt: new Date() };
      whereChain.then.mockImplementation((resolve: any) => resolve([{ total: 1 }]));
      whereChain.offset.mockResolvedValue([category]);
      const result = await service.findAll('cry');
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('does not throw when query contains LIKE special characters', async () => {
      whereChain.then.mockImplementation((resolve: any) => resolve([{ total: 0 }]));
      whereChain.offset.mockResolvedValue([]);
      await expect(service.findAll('50%_off\\deal')).resolves.not.toThrow();
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException when not found', async () => {
      // findOne chain: .select().from().where() awaited — terminal is whereChain.then
      whereChain.then.mockImplementation((resolve: any, _reject: any) =>
        resolve([]),
      );
      await expect(service.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns category when found', async () => {
      const category = { id: 'uuid-1', name: 'Test', emoji: null, deletedAt: null, createdAt: new Date() };
      whereChain.then.mockImplementation((resolve: any, _reject: any) =>
        resolve([category]),
      );
      const result = await service.findOne('uuid-1');
      expect(result).toEqual(category);
    });
  });

  describe('create', () => {
    it('returns newly created category', async () => {
      // create chain: .insert().values().returning() — terminal is mockDb.returning
      const category = {
        id: 'uuid-1',
        name: 'New Category',
        emoji: null,
        deletedAt: null,
        createdAt: new Date(),
      };
      mockDb.returning.mockResolvedValue([category]);
      const result = await service.create({ name: 'New Category' });
      expect(result).toEqual(category);
    });

    it('does not enforce max-length on name (DTO gap — backend accepts oversized input)', async () => {
      const longName = 'a'.repeat(200);
      const category = { id: 'uuid-1', name: longName, emoji: null, deletedAt: null, createdAt: new Date() };
      mockDb.returning.mockResolvedValue([category]);
      const result = await service.create({ name: longName });
      // If @MaxLength were enforced at service level this would throw; currently it returns.
      expect(result.name).toHaveLength(200);
    });

    it('passes emoji when provided', async () => {
      const category = { id: 'uuid-1', name: 'New', emoji: '🏖️', deletedAt: null, createdAt: new Date() };
      mockDb.returning.mockResolvedValue([category]);
      const result = await service.create({ name: 'New', emoji: '🏖️' });
      expect(result.emoji).toBe('🏖️');
    });

    it('accepts undefined emoji (no emoji case)', async () => {
      const category = { id: 'uuid-1', name: 'New', emoji: null, deletedAt: null, createdAt: new Date() };
      mockDb.returning.mockResolvedValue([category]);
      const result = await service.create({ name: 'New' });
      expect(result.emoji).toBeNull();
    });
  });

  describe('update', () => {
    it('throws BadRequestException when body is empty', async () => {
      await expect(service.update('uuid-1', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('returns updated category', async () => {
      // update chain: .update().set().where().returning() — terminal is whereChain.returning
      const category = { id: 'uuid-1', name: 'Updated', emoji: null, deletedAt: null, createdAt: new Date() };
      whereChain.returning.mockResolvedValue([category]);
      const result = await service.update('uuid-1', { name: 'Updated' });
      expect(result).toEqual(category);
    });

    it('throws NotFoundException when category not found', async () => {
      whereChain.returning.mockResolvedValue([]);
      await expect(
        service.update('non-existent', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('returns deleted category', async () => {
      // remove now uses update (soft delete): .update().set().where().returning()
      const category = { id: 'uuid-1', name: 'Deleted', emoji: null, deletedAt: new Date(), createdAt: new Date() };
      whereChain.returning.mockResolvedValue([category]);
      const result = await service.remove('uuid-1');
      expect(result).toEqual(category);
    });

    it('throws NotFoundException when category not found', async () => {
      whereChain.returning.mockResolvedValue([]);
      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('calls update (not delete) for soft delete', async () => {
      const category = { id: 'uuid-1', name: 'Deleted', emoji: null, deletedAt: new Date(), createdAt: new Date() };
      whereChain.returning.mockResolvedValue([category]);
      await service.remove('uuid-1');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.delete).not.toHaveBeenCalled();
    });
  });
});
