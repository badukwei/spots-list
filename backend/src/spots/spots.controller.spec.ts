// src/spots/spots.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { SpotsController } from './spots.controller';
import { SpotsService } from './spots.service';
import { UpdateSpotDto } from './dto/update-spot.dto';

describe('SpotsController', () => {
  let controller: SpotsController;

  const mockService = {
    findByCategory: jest.fn().mockResolvedValue({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 }),
    create: jest
      .fn()
      .mockResolvedValue({ id: 'spot-1', name: 'Spot', categoryId: 'cat-1' }),
    update: jest.fn().mockResolvedValue({ id: 'spot-1', name: 'Updated' }),
    remove: jest.fn().mockResolvedValue({ id: 'spot-1' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SpotsController],
      providers: [{ provide: SpotsService, useValue: mockService }],
    }).compile();

    controller = module.get<SpotsController>(SpotsController);
  });

  it('findByCategory calls service with categoryId, pagination and no search', async () => {
    const result = await controller.findByCategory('cat-1', { page: 1, limit: 20 });
    expect(mockService.findByCategory).toHaveBeenCalledWith('cat-1', undefined, 1, 20);
    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  });

  it('findByCategory passes search query to service', async () => {
    await controller.findByCategory('cat-1', { q: 'coffee', page: 1, limit: 20 });
    expect(mockService.findByCategory).toHaveBeenCalledWith('cat-1', 'coffee', 1, 20);
  });

  it('create calls service with categoryId and dto', async () => {
    const dto = { name: 'New Spot' };
    const result = await controller.create('cat-1', dto);
    expect(mockService.create).toHaveBeenCalledWith('cat-1', dto);
    expect(result).toEqual({ id: 'spot-1', name: 'Spot', categoryId: 'cat-1' });
  });

  it('update calls service with categoryId, id and dto', async () => {
    const dto: UpdateSpotDto = { name: 'Updated' };
    await controller.update('cat-1', 'spot-1', dto);
    expect(mockService.update).toHaveBeenCalledWith('cat-1', 'spot-1', dto);
  });

  it('remove calls service with categoryId and id', async () => {
    await controller.remove('cat-1', 'spot-1');
    expect(mockService.remove).toHaveBeenCalledWith('cat-1', 'spot-1');
  });
});
