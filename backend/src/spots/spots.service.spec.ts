import { Test, TestingModule } from '@nestjs/testing';
import { SpotsService } from './spots.service';
import { DATABASE } from '../db/db.module';
import { CategoriesService } from '../categories/categories.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('SpotsService', () => {
  let service: SpotsService;
  let mockDb: any;
  let whereChain: any;
  let mockCategoriesService: any;

  beforeEach(async () => {
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

    mockCategoriesService = {
      findOne: jest.fn().mockResolvedValue({
        id: 'cat-1',
        name: 'Test Category',
        deletedAt: null,
        createdAt: new Date(),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotsService,
        { provide: DATABASE, useValue: mockDb },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile();

    service = module.get<SpotsService>(SpotsService);
  });

  describe('findByCategory', () => {
    it('returns empty array when no spots', async () => {
      whereChain.orderBy.mockResolvedValue([]);
      const result = await service.findByCategory('cat-1');
      expect(result).toEqual([]);
    });

    it('returns spots when found', async () => {
      const spot = {
        id: 'spot-1',
        name: 'Test Spot',
        categoryId: 'cat-1',
        deletedAt: null,
        createdAt: new Date(),
      };
      whereChain.orderBy.mockResolvedValue([spot]);
      const result = await service.findByCategory('cat-1');
      expect(result).toHaveLength(1);
    });

    it('throws NotFoundException when category not found', async () => {
      mockCategoriesService.findOne.mockRejectedValue(
        new NotFoundException('Category not found'),
      );
      await expect(service.findByCategory('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('returns newly created spot', async () => {
      const spot = {
        id: 'spot-1',
        name: 'New Spot',
        categoryId: 'cat-1',
        deletedAt: null,
        createdAt: new Date(),
      };
      mockDb.returning.mockResolvedValue([spot]);
      const result = await service.create('cat-1', { name: 'New Spot' });
      expect(result).toEqual(spot);
    });

    it('throws NotFoundException when category not found', async () => {
      mockCategoriesService.findOne.mockRejectedValue(
        new NotFoundException('Category not found'),
      );
      await expect(
        service.create('non-existent', { name: 'Spot' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('throws BadRequestException when body is empty', async () => {
      await expect(service.update('cat-1', 'spot-1', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('returns updated spot', async () => {
      const spot = {
        id: 'spot-1',
        name: 'Updated',
        categoryId: 'cat-1',
        deletedAt: null,
        createdAt: new Date(),
      };
      whereChain.returning.mockResolvedValue([spot]);
      const result = await service.update('cat-1', 'spot-1', {
        name: 'Updated',
      });
      expect(result).toEqual(spot);
    });

    it('throws NotFoundException when spot not found', async () => {
      whereChain.returning.mockResolvedValue([]);
      await expect(
        service.update('cat-1', 'non-existent', { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('returns deleted spot', async () => {
      const spot = {
        id: 'spot-1',
        name: 'Spot',
        categoryId: 'cat-1',
        deletedAt: new Date(),
        createdAt: new Date(),
      };
      whereChain.returning.mockResolvedValue([spot]);
      const result = await service.remove('cat-1', 'spot-1');
      expect(result).toEqual(spot);
    });

    it('throws NotFoundException when spot not found', async () => {
      whereChain.returning.mockResolvedValue([]);
      await expect(service.remove('cat-1', 'non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    // Cross-category isolation: remove propagates category NotFoundException
    it('throws NotFoundException when category not found', async () => {
      mockCategoriesService.findOne.mockRejectedValue(
        new NotFoundException('Category not found'),
      );
      await expect(service.remove('non-existent-cat', 'spot-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('calls update (not delete) for soft delete', async () => {
      const spot = { id: 'spot-1', name: 'Spot', categoryId: 'cat-1', deletedAt: new Date(), createdAt: new Date() };
      whereChain.returning.mockResolvedValue([spot]);
      await service.remove('cat-1', 'spot-1');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.delete).not.toHaveBeenCalled();
    });
  });

  // NOTE: update() and remove() filter spots only by spot id, NOT by (categoryId, id).
  // A spot belonging to a different category can be mutated or deleted if its id is known.
  // These tests document the current (unguarded) behaviour so a future fix is detectable.
  describe('cross-category isolation gap (documented behaviour)', () => {
    it('update: modifies a spot even when it belongs to a different category', async () => {
      // spot-99 belongs to cat-99, but we call update with cat-1
      const spotFromAnotherCategory = {
        id: 'spot-99',
        name: 'Updated',
        categoryId: 'cat-99',
        deletedAt: null,
        createdAt: new Date(),
      };
      whereChain.returning.mockResolvedValue([spotFromAnotherCategory]);
      // Should ideally throw, but currently succeeds
      const result = await service.update('cat-1', 'spot-99', { name: 'Updated' });
      expect(result).toEqual(spotFromAnotherCategory);
    });

    it('remove: deletes a spot even when it belongs to a different category', async () => {
      const spotFromAnotherCategory = {
        id: 'spot-99',
        name: 'Spot',
        categoryId: 'cat-99',
        deletedAt: new Date(),
        createdAt: new Date(),
      };
      whereChain.returning.mockResolvedValue([spotFromAnotherCategory]);
      // Should ideally throw, but currently succeeds
      const result = await service.remove('cat-1', 'spot-99');
      expect(result).toEqual(spotFromAnotherCategory);
    });
  });
});
