import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryMovementService } from './inventory.movement.service.js';
import { InventoryMovement } from '../entities/inventory.movement.entity.js';

describe('InventoryMovementService', () => {
  let service: InventoryMovementService;
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
      providers: [InventoryMovementService, { provide: getRepositoryToken(InventoryMovement), useValue: repository }],
    }).compile();

    service = module.get<InventoryMovementService>(InventoryMovementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all inventory movements with their relations', async () => {
    const movements = [{ id: 1, observation: 'Entrada de lote' }];
    repository.find.mockResolvedValue(movements);

    await expect(service.findAll()).resolves.toBe(movements);
    expect(repository.find).toHaveBeenCalledWith({
      relations: { batch: true, ordersProduction: true, typeMovement: true },
    });
  });

  it('creates an inventory movement with its related records', async () => {
    const date = new Date('2026-10-15T10:00:00.000Z');
    const movement = {
      id: 1,
      quantity: 10,
      date,
      observation: 'Entrada de lote',
      batch: { id: 2 },
      ordersProduction: { id: 3 },
      typeMovement: { id: 4 },
    };
    repository.save.mockResolvedValue({ id: 1 });
    repository.findOne.mockResolvedValue(movement);

    await expect(
      service.create({
        quantity: 10,
        date,
        observation: 'Entrada de lote',
        batchId: 2,
        orderProductionId: 3,
        typeMovementId: 4,
      }),
    ).resolves.toBe(movement);
    expect(repository.save).toHaveBeenCalledWith({
      quantity: 10,
      date,
      observation: 'Entrada de lote',
      batch: { id: 2 },
      ordersProduction: { id: 3 },
      typeMovement: { id: 4 },
    });
  });

  it('creates an inventory movement without a production order', async () => {
    const date = new Date('2026-10-15T10:00:00.000Z');
    const movement = { id: 2, quantity: 10, date, observation: 'Entrada inicial de lote' };
    repository.save.mockResolvedValue({ id: 2 });
    repository.findOne.mockResolvedValue(movement);

    await expect(
      service.create({
        quantity: 10,
        date,
        observation: 'Entrada inicial de lote',
        batchId: 2,
        typeMovementId: 1,
      }),
    ).resolves.toBe(movement);
    expect(repository.save).toHaveBeenCalledWith({
      quantity: 10,
      date,
      observation: 'Entrada inicial de lote',
      batch: { id: 2 },
      typeMovement: { id: 1 },
    });
  });

  it('finds an inventory movement by id and throws when it does not exist', async () => {
    const movement = { id: 1, observation: 'Entrada de lote' };
    repository.findOne.mockResolvedValueOnce(movement).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(movement);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      relations: { batch: true, ordersProduction: true, typeMovement: true },
    });
  });

  it('updates an inventory movement and its relations', async () => {
    const movement = { id: 1, observation: 'Entrada de lote' } as InventoryMovement;
    const updatedMovement = { ...movement, observation: 'Ajuste de inventario', batch: { id: 5 } };
    repository.findOne.mockResolvedValueOnce(movement).mockResolvedValueOnce(updatedMovement);
    repository.merge.mockReturnValue(updatedMovement);
    repository.save.mockResolvedValue(updatedMovement);

    await expect(service.update(1, { observation: 'Ajuste de inventario', batchId: 5 })).resolves.toBe(updatedMovement);
    expect(repository.merge).toHaveBeenCalledWith(movement, {
      observation: 'Ajuste de inventario',
      batch: { id: 5 },
    });
    expect(repository.save).toHaveBeenCalledWith(updatedMovement);
  });

  it('removes an existing inventory movement', async () => {
    const movement = { id: 1, observation: 'Entrada de lote' } as InventoryMovement;
    repository.findOne.mockResolvedValue(movement);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(movement);
  });
});
