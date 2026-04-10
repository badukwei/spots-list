import { Test, TestingModule } from '@nestjs/testing'
import { SpotsService } from './spots.service'
import { DATABASE } from '../db/db.module'
import { CategoriesService } from '../categories/categories.service'
import { NotFoundException } from '@nestjs/common'

describe('SpotsService', () => {
  let service: SpotsService
  let mockDb: any
  let whereChain: any
  let mockCategoriesService: any

  beforeEach(async () => {
    whereChain = {
      orderBy: jest.fn().mockResolvedValue([]),
      returning: jest.fn().mockResolvedValue([]),
      then: jest.fn((resolve, _reject) => resolve([])),
    }

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
    }

    mockCategoriesService = {
      findOne: jest.fn().mockResolvedValue({ id: 'cat-1', name: 'Test Category', createdAt: new Date() }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotsService,
        { provide: DATABASE, useValue: mockDb },
        { provide: CategoriesService, useValue: mockCategoriesService },
      ],
    }).compile()

    service = module.get<SpotsService>(SpotsService)
  })

  describe('findByCategory', () => {
    it('returns empty array when no spots', async () => {
      whereChain.orderBy.mockResolvedValue([])
      const result = await service.findByCategory('cat-1')
      expect(result).toEqual([])
    })

    it('returns spots when found', async () => {
      const spot = { id: 'spot-1', name: 'Test Spot', categoryId: 'cat-1', createdAt: new Date() }
      whereChain.orderBy.mockResolvedValue([spot])
      const result = await service.findByCategory('cat-1')
      expect(result).toHaveLength(1)
    })

    it('throws NotFoundException when category not found', async () => {
      mockCategoriesService.findOne.mockRejectedValue(new NotFoundException('Category not found'))
      await expect(service.findByCategory('non-existent')).rejects.toThrow(NotFoundException)
    })
  })

  describe('create', () => {
    it('returns newly created spot', async () => {
      const spot = { id: 'spot-1', name: 'New Spot', categoryId: 'cat-1', createdAt: new Date() }
      mockDb.returning.mockResolvedValue([spot])
      const result = await service.create('cat-1', { name: 'New Spot' })
      expect(result).toEqual(spot)
    })

    it('throws NotFoundException when category not found', async () => {
      mockCategoriesService.findOne.mockRejectedValue(new NotFoundException('Category not found'))
      await expect(service.create('non-existent', { name: 'Spot' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('update', () => {
    it('returns updated spot', async () => {
      const spot = { id: 'spot-1', name: 'Updated', categoryId: 'cat-1', createdAt: new Date() }
      whereChain.returning.mockResolvedValue([spot])
      const result = await service.update('spot-1', { name: 'Updated' })
      expect(result).toEqual(spot)
    })

    it('throws NotFoundException when spot not found', async () => {
      whereChain.returning.mockResolvedValue([])
      await expect(service.update('non-existent', { name: 'X' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('returns deleted spot', async () => {
      const spot = { id: 'spot-1', name: 'Spot', categoryId: 'cat-1', createdAt: new Date() }
      whereChain.returning.mockResolvedValue([spot])
      const result = await service.remove('spot-1')
      expect(result).toEqual(spot)
    })

    it('throws NotFoundException when spot not found', async () => {
      whereChain.returning.mockResolvedValue([])
      await expect(service.remove('non-existent')).rejects.toThrow(NotFoundException)
    })
  })
})
