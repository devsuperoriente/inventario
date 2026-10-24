import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RawMaterialConsumption } from '../entities/raw.material.consumption.entity.js';
import { RawMaterialConsumptionService } from './raw.material.consumption.service.js';

describe('RawMaterialConsumptionService', () => {
  let service: RawMaterialConsumptionService;
  let repository: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      find: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RawMaterialConsumptionService, { provide: getRepositoryToken(RawMaterialConsumption), useValue: repository }],
    }).compile();

    service = module.get<RawMaterialConsumptionService>(RawMaterialConsumptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all consumptions with their batch and production order', async () => {
    const consumptions = [{ id: 1, observation: 'Consumo de lote' }];
    repository.find.mockResolvedValue(consumptions);

    await expect(service.findAll()).resolves.toBe(consumptions);
    expect(repository.find).toHaveBeenCalledWith({
      relations: { batch: true, ordersProduction: true },
    });
  });

  it('finds a consumption by id and throws when it does not exist', async () => {
    const consumption = { id: 1, observation: 'Consumo de lote' };
    repository.findOne.mockResolvedValueOnce(consumption).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(consumption);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      relations: { batch: true, ordersProduction: true },
    });
  });
});
