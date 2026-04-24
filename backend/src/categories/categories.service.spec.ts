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
      orderBy: jest.fn().mockResolvedValue([]),
      returning: jest.fn().mockResolvedValue([]),
      then: jest.fn((resolve, _reject) => resolve([])),
    };

    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([]),
      where: jest.fn().mockReturnValue(whereChain),
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
    it('returns empty array when no categories', async () => {
      mockDb.orderBy.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toEqual([]);
    });

    it('calls where with ilike when query is provided', async () => {
      // findAll(q) chain: .select().from().where().orderBy() — terminal is whereChain.orderBy
      whereChain.orderBy.mockResolvedValue([
        { id: 'uuid-1', name: 'cry place', emoji: null, createdAt: new Date() },
      ]);
      const result = await service.findAll('cry');
      expect(mockDb.where).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('does not throw when query contains LIKE special characters', async () => {
      whereChain.orderBy.mockResolvedValue([]);
      await expect(service.findAll('50%_off\\deal')).resolves.not.toThrow();
      expect(mockDb.where).toHaveBeenCalled();
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
      const category = { id: 'uuid-1', name: 'Test', emoji: null, createdAt: new Date() };
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
        createdAt: new Date(),
      };
      mockDb.returning.mockResolvedValue([category]);
      const result = await service.create({ name: 'New Category' });
      expect(result).toEqual(category);
    });

    // NOTE: CreateCategoryDto has no @MaxLength decorator, so the backend currently accepts
    // names longer than 100 chars even though the frontend schema rejects them.
    // This test documents that the service itself does NOT enforce a length limit.
    it('does not enforce max-length on name (DTO gap — backend accepts oversized input)', async () => {
      const longName = 'a'.repeat(200);
      const category = { id: 'uuid-1', name: longName, emoji: null, createdAt: new Date() };
      mockDb.returning.mockResolvedValue([category]);
      const result = await service.create({ name: longName });
      // If @MaxLength were enforced at service level this would throw; currently it returns.
      expect(result.name).toHaveLength(200);
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
      const category = { id: 'uuid-1', name: 'Updated', emoji: null, createdAt: new Date() };
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
      // remove chain: .delete().where().returning() — terminal is whereChain.returning
      const category = { id: 'uuid-1', name: 'Deleted', emoji: null, createdAt: new Date() };
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
  });
});
