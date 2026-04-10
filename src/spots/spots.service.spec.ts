// src/spots/spots.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { SpotsService } from './spots.service'
import { DATABASE } from '../db/db.module'
import { NotFoundException } from '@nestjs/common'

describe('SpotsService', () => {
  let service: SpotsService
  let mockDb: any
  let whereChain: any

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpotsService,
        { provide: DATABASE, useValue: mockDb },
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

    it('returns spots for a category', async () => {
      const spot = { id: 'spot-1', name: 'Test Spot', categoryId: 'cat-1', createdAt: new Date() }
      whereChain.orderBy.mockResolvedValue([spot])
      const result = await service.findByCategory('cat-1')
      expect(mockDb.where).toHaveBeenCalled()
      expect(result).toEqual([spot])
    })
  })

  describe('create', () => {
    it('returns newly created spot', async () => {
      const spot = { id: 'spot-1', name: 'New Spot', categoryId: 'cat-1', createdAt: new Date() }
      mockDb.returning.mockResolvedValue([spot])
      const result = await service.create('cat-1', { name: 'New Spot' })
      expect(result).toEqual(spot)
    })
  })

  describe('update', () => {
    it('returns updated spot', async () => {
      const spot = { id: 'spot-1', name: 'Updated Spot', categoryId: 'cat-1', createdAt: new Date() }
      whereChain.returning.mockResolvedValue([spot])
      const result = await service.update('spot-1', { name: 'Updated Spot' })
      expect(result).toEqual(spot)
    })

    it('throws NotFoundException when spot not found', async () => {
      whereChain.returning.mockResolvedValue([])
      await expect(service.update('non-existent', { name: 'X' })).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('returns deleted spot', async () => {
      const spot = { id: 'spot-1', name: 'Deleted Spot', categoryId: 'cat-1', createdAt: new Date() }
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
