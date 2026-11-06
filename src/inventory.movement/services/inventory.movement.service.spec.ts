import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InventoryMovementService } from './inventory.movement.service.js';
import { InventoryMovement } from '../entities/inventory.movement.entity.js';
import { Batch } from '../../batchs/entities/batch.entity.js';
import { TypeMovement } from '../entities/type.movement.entity.js';

describe('InventoryMovementService', () => {
  let service: InventoryMovementService;
  let repository: {
    manager: { transaction: ReturnType<typeof vi.fn> };
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    merge: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  const configureCreateTransaction = ({ batch, typeMovement }: { batch: Batch | null; typeMovement: TypeMovement | null }) => {
    const batchRepository = {
      findOne: vi.fn().mockResolvedValue(batch),
      save: vi.fn(async (value) => value),
    };
    const movementRepository = {
      create: vi.fn((value) => value),
      save: vi.fn(async (value) => ({ id: 11, ...value })),
    };
    const typeMovementRepository = {
      findOne: vi.fn().mockResolvedValue(typeMovement),
    };
    const manager = {
      getRepository: (entity: typeof InventoryMovement | typeof Batch | typeof TypeMovement) => {
        if (entity === InventoryMovement) return movementRepository;
        if (entity === Batch) return batchRepository;
        return typeMovementRepository;
      },
    };
    repository.manager.transaction.mockImplementation((callback) => callback(manager));

    return { batchRepository, movementRepository, typeMovementRepository };
  };

  beforeEach(async () => {
    repository = {
      manager: { transaction: vi.fn() },
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
    const batch = { id: 2, quantityAvailable: '10.00' } as Batch;
    const movement = {
      id: 1,
      quantity: 10,
      date,
      observation: 'Entrada de lote',
      batch: { id: 2 },
      ordersProduction: { id: 3 },
      typeMovement: { id: 4 },
    };
    const { movementRepository } = configureCreateTransaction({
      batch,
      typeMovement: { id: 4, name: 'ENTRADA', isActive: true } as TypeMovement,
    });
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
    expect(movementRepository.save).toHaveBeenCalledWith({
      quantity: 10,
      balancePrevius: undefined,
      balanceCurrent: undefined,
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
    const { movementRepository } = configureCreateTransaction({
      batch: { id: 2, quantityAvailable: '10.00' } as Batch,
      typeMovement: { id: 1, name: 'ENTRADA', isActive: true } as TypeMovement,
    });
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
    expect(movementRepository.save).toHaveBeenCalledWith({
      quantity: 10,
      balancePrevius: undefined,
      balanceCurrent: undefined,
      date,
      observation: 'Entrada inicial de lote',
      batch: { id: 2 },
      typeMovement: { id: 1 },
    });
  });

  it.each(['SALIDA', 'MERMA'])('subtracts %s quantity from the batch and records the calculated balances', async (movementName) => {
    const batch = { id: 2, code: 'L-000002', quantityAvailable: '10.25' } as Batch;
    const { batchRepository, movementRepository } = configureCreateTransaction({
      batch,
      typeMovement: { id: 4, name: movementName, isActive: true } as TypeMovement,
    });
    const movement = { id: 11, quantity: 3.25, balancePrevius: '10.25', balanceCurrent: '7' };
    repository.findOne.mockResolvedValue(movement);

    await expect(
      service.create({
        quantity: 3.25,
        date: new Date('2026-10-15T10:00:00.000Z'),
        observation: 'Salida de inventario',
        batchId: 2,
        typeMovementId: 4,
      }),
    ).resolves.toBe(movement);

    expect(batch.quantityAvailable).toBe('7');
    expect(batchRepository.save).toHaveBeenCalledWith(batch);
    expect(movementRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 3.25,
        balancePrevius: '10.25',
        balanceCurrent: '7',
        batch: { id: 2 },
        typeMovement: { id: 4 },
      }),
    );
  });

  it('rejects a SALIDA or MERMA that exceeds the batch balance without saving', async () => {
    const { batchRepository, movementRepository } = configureCreateTransaction({
      batch: { id: 2, code: 'L-000002', quantityAvailable: '2' } as Batch,
      typeMovement: { id: 4, name: 'MERMA', isActive: true } as TypeMovement,
    });

    await expect(
      service.create({
        quantity: 3,
        date: new Date('2026-10-15T10:00:00.000Z'),
        observation: 'Merma de inventario',
        batchId: 2,
        typeMovementId: 4,
      }),
    ).rejects.toThrow(UnprocessableEntityException);

    expect(batchRepository.save).not.toHaveBeenCalled();
    expect(movementRepository.save).not.toHaveBeenCalled();
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

    await expect(service.remove(1)).resolves.toEqual({
      success: true,
      message: 'Movimiento de inventario eliminado correctamente',
    });
    expect(repository.remove).toHaveBeenCalledWith(movement);
  });
});
