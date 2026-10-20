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
    save: ReturnType<typeof vi.fn>;
    merge: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      find: vi.fn(),
      findOne: vi.fn(),
      save: vi.fn(),
      merge: vi.fn(),
      remove: vi.fn(),
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

  it('creates a consumption with its batch and production order', async () => {
    const date = new Date('2026-10-15T10:00:00.000Z');
    const consumption = {
      id: 1,
      quantity: 10,
      date,
      observation: 'Consumo de lote',
      batch: { id: 2 },
      ordersProduction: { id: 3 },
    };
    repository.save.mockResolvedValue({ id: 1 });
    repository.findOne.mockResolvedValue(consumption);

    await expect(
      service.create({
        quantity: 10,
        date,
        observation: 'Consumo de lote',
        batchId: 2,
        orderProductionId: 3,
      }),
    ).resolves.toBe(consumption);
    expect(repository.save).toHaveBeenCalledWith({
      quantity: 10,
      date,
      observation: 'Consumo de lote',
      batch: { id: 2 },
      ordersProduction: { id: 3 },
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

  it('updates a consumption and its relations', async () => {
    const consumption = { id: 1, observation: 'Consumo de lote' } as RawMaterialConsumption;
    const updatedConsumption = { ...consumption, observation: 'Consumo actualizado', batch: { id: 4 } };
    repository.findOne.mockResolvedValueOnce(consumption).mockResolvedValueOnce(updatedConsumption);
    repository.merge.mockReturnValue(updatedConsumption);
    repository.save.mockResolvedValue(updatedConsumption);

    await expect(service.update(1, { observation: 'Consumo actualizado', batchId: 4 })).resolves.toBe(updatedConsumption);
    expect(repository.merge).toHaveBeenCalledWith(consumption, {
      observation: 'Consumo actualizado',
      batch: { id: 4 },
    });
    expect(repository.save).toHaveBeenCalledWith(updatedConsumption);
  });

  it('removes an existing consumption', async () => {
    const consumption = { id: 1, observation: 'Consumo de lote' } as RawMaterialConsumption;
    repository.findOne.mockResolvedValue(consumption);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(consumption);
  });
});
