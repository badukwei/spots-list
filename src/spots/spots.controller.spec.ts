// src/spots/spots.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { SpotsController } from './spots.controller'
import { SpotsService } from './spots.service'

describe('SpotsController', () => {
  let controller: SpotsController

  const mockService = {
    findByCategory: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockResolvedValue({ id: 'spot-1', name: 'New Spot' }),
    update: jest.fn().mockResolvedValue({ id: 'spot-1', name: 'Updated Spot' }),
    remove: jest.fn().mockResolvedValue({ id: 'spot-1', name: 'Deleted Spot' }),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpotsController],
      providers: [{ provide: SpotsService, useValue: mockService }],
    }).compile()

    controller = module.get<SpotsController>(SpotsController)
  })

  it('findByCategory calls service with categoryId', async () => {
    const result = await controller.findByCategory('cat-1')
    expect(mockService.findByCategory).toHaveBeenCalledWith('cat-1')
    expect(result).toEqual([])
  })

  it('create calls service with categoryId and dto', async () => {
    const dto = { name: 'New Spot' }
    const result = await controller.create('cat-1', dto)
    expect(mockService.create).toHaveBeenCalledWith('cat-1', dto)
    expect(result).toEqual({ id: 'spot-1', name: 'New Spot' })
  })

  it('update calls service with id and dto', async () => {
    const dto = { name: 'Updated Spot' }
    const result = await controller.update('spot-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('spot-1', dto)
    expect(result).toEqual({ id: 'spot-1', name: 'Updated Spot' })
  })

  it('remove calls service with id', async () => {
    const result = await controller.remove('spot-1')
    expect(mockService.remove).toHaveBeenCalledWith('spot-1')
    expect(result).toEqual({ id: 'spot-1', name: 'Deleted Spot' })
  })
})
