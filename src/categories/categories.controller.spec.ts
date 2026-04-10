import { Test, TestingModule } from '@nestjs/testing'
import { CategoriesController } from './categories.controller'
import { CategoriesService } from './categories.service'

describe('CategoriesController', () => {
  let controller: CategoriesController

  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'uuid-1', name: 'Test', createdAt: new Date() }),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile()

    controller = module.get<CategoriesController>(CategoriesController)
  })

  it('findAll calls service.findAll without query', async () => {
    await controller.findAll(undefined)
    expect(mockService.findAll).toHaveBeenCalledWith(undefined)
  })

  it('findOne calls service.findOne with id', async () => {
    await controller.findOne('uuid-1')
    expect(mockService.findOne).toHaveBeenCalledWith('uuid-1')
  })
})
