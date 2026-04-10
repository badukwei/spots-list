import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesService } from './categories.service'
import { DATABASE } from '../db/db.module'
import { NotFoundException } from '@nestjs/common'

describe('CategoriesService', () => {
  let service: CategoriesService
  let mockDb: any

  beforeEach(async () => {
    mockDb = {
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockResolvedValue([]),
      where: jest.fn().mockResolvedValue([]),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: DATABASE, useValue: mockDb },
      ],
    }).compile()

    service = module.get<CategoriesService>(CategoriesService)
  })

  it('findAll returns empty array when no categories', async () => {
    mockDb.orderBy.mockResolvedValue([])
    const result = await service.findAll()
    expect(result).toEqual([])
  })

  it('findOne throws NotFoundException when not found', async () => {
    mockDb.where.mockResolvedValue([])
    await expect(service.findOne('non-existent-id')).rejects.toThrow(NotFoundException)
  })
})
