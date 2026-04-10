// src/categories/categories.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockService = {
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest
      .fn()
      .mockResolvedValue({ id: 'uuid-1', name: 'Test', createdAt: new Date() }),
    create: jest.fn().mockResolvedValue({ id: 'uuid-1', name: 'New' }),
    update: jest.fn().mockResolvedValue({ id: 'uuid-1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: 'uuid-1', name: 'Deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [{ provide: CategoriesService, useValue: mockService }],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('findAll calls service.findAll without query', async () => {
    await controller.findAll(undefined);
    expect(mockService.findAll).toHaveBeenCalledWith(undefined);
  });

  it('findAll calls service.findAll with query', async () => {
    await controller.findAll('cry');
    expect(mockService.findAll).toHaveBeenCalledWith('cry');
  });

  it('findOne calls service.findOne with id', async () => {
    await controller.findOne('uuid-1');
    expect(mockService.findOne).toHaveBeenCalledWith('uuid-1');
  });

  it('create calls service.create with dto', async () => {
    const dto = { name: 'New Category' };
    const result = await controller.create(dto);
    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 'uuid-1', name: 'New' });
  });

  it('update calls service.update with id and dto', async () => {
    const dto = { name: 'Updated' };
    const result = await controller.update('uuid-1', dto);
    expect(mockService.update).toHaveBeenCalledWith('uuid-1', dto);
    expect(result).toEqual({ id: 'uuid-1', name: 'Updated' });
  });

  it('remove calls service.remove with id', async () => {
    const result = await controller.remove('uuid-1');
    expect(mockService.remove).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual({ id: 'uuid-1', name: 'Deleted' });
  });
});
