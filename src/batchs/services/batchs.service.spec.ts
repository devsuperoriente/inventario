import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BatchsService } from './batchs.service.js';
import { Batch } from '../entities/batch.entity.js';
import { CreateBatchDto } from '../dto/create-batch.dto.js';
import { InventoryMovement } from '../../inventory.movement/entities/inventory.movement.entity.js';
import { TypeMovement } from '../../inventory.movement/entities/type.movement.entity.js';

describe('BatchsService', () => {
  let service: BatchsService;
  let repository: {
    manager: { transaction: ReturnType<typeof vi.fn> };
    create: ReturnType<typeof vi.fn>;
    createQueryBuilder: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    merge: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      manager: { transaction: vi.fn() },
      create: vi.fn(),
      createQueryBuilder: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      save: vi.fn(),
      merge: vi.fn(),
      remove: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [BatchsService, { provide: getRepositoryToken(Batch), useValue: repository }],
    }).compile();

    service = module.get<BatchsService>(BatchsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all batches', async () => {
    const batches = [{ id: 1, code: 'BATCH-1' }];
    repository.find.mockResolvedValue(batches);

    await expect(service.findAll()).resolves.toBe(batches);
    expect(repository.find).toHaveBeenCalledWith({
      relations: { product: true, provider: true },
    });
  });

  it('summarizes positive stock by product using available batch balances', async () => {
    const queryBuilder = {
      innerJoin: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      addSelect: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      groupBy: vi.fn().mockReturnThis(),
      addGroupBy: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      getRawMany: vi.fn().mockResolvedValue([
        {
          productoId: '12',
          producto: 'Caramelo proceso amonio Levapan x5000g',
          unidad: 'g',
          cantidadDisponible: '60005.00',
        },
        {
          productoId: '20',
          producto: 'Pandequeso',
          unidad: 'unidad',
          cantidadDisponible: '500.00',
        },
      ]),
    };
    repository.createQueryBuilder.mockReturnValue(queryBuilder);

    await expect(service.getStockSummary()).resolves.toEqual({
      existencias: [
        {
          productoId: 12,
          producto: 'Caramelo proceso amonio Levapan x5000g',
          unidad: 'g',
          cantidadDisponible: '60005.00',
        },
        {
          productoId: 20,
          producto: 'Pandequeso',
          unidad: 'unidad',
          cantidadDisponible: '500.00',
        },
      ],
    });
    expect(queryBuilder.where).toHaveBeenCalledWith('batch.quantityAvailable > 0');
    expect(queryBuilder.addSelect).toHaveBeenCalledWith('SUM(batch.quantityAvailable)', 'cantidadDisponible');
    expect(queryBuilder.groupBy).toHaveBeenCalledWith('product.id');
  });

  it('lists product batches ordered by expiration date', async () => {
    const batches = [
      {
        id: 3,
        code: 'L-000003',
        entryDate: new Date('2026-01-01'),
        expirationDate: new Date('2026-02-01'),
        quantityInitial: '10.00',
        quantityAvailable: '4.00',
        provider: { name: 'Proveedor A' },
        product: { name: 'Harina', unitsMeasurement: { abbreviation: 'g' } },
      },
    ];
    repository.find.mockResolvedValue(batches);

    await expect(service.getStockByProduct(12)).resolves.toEqual({
      productoId: 12,
      producto: 'Harina',
      unidad: 'g',
      lotes: [
        {
          id: 3,
          codigo: 'L-000003',
          proveedor: 'Proveedor A',
          fechaIngreso: batches[0].entryDate,
          fechaVencimiento: batches[0].expirationDate,
          cantidadInicial: '10.00',
          cantidadDisponible: '4.00',
        },
      ],
    });
    expect(repository.find).toHaveBeenCalledWith({
      where: { product: { id: 12 } },
      relations: { product: { unitsMeasurement: true }, provider: true },
      order: { expirationDate: 'ASC', entryDate: 'ASC' },
    });
  });

  it('creates a batch and its initial inventory entry atomically', async () => {
    const createBatchDto = {
      entryDate: new Date('2026-01-01'),
      expirationDate: new Date('2026-02-01'),
      quantityInitial: 12,
      quantityAvailable: 12,
      productId: 4,
      providerId: 5,
      observation: 'Test batch',
      imageUrl: 'batch.png',
    } satisfies CreateBatchDto;
    const batchRepository = {
      create: vi.fn((value) => value),
      save: vi.fn(async (value) => ({ id: 1, ...value })),
    };
    const inventoryMovementsRepository = {
      create: vi.fn((value) => value),
      save: vi.fn(async (value) => value),
    };
    const typeMovementsRepository = {
      findOne: vi.fn().mockResolvedValue({ id: 6, name: 'ENTRADA', isActive: true }),
    };
    repository.manager.transaction.mockImplementation((callback) =>
      callback({
        getRepository: (entity: typeof Batch | typeof InventoryMovement | typeof TypeMovement) => {
          if (entity === Batch) return batchRepository;
          if (entity === InventoryMovement) return inventoryMovementsRepository;
          return typeMovementsRepository;
        },
      }),
    );

    await expect(service.create(createBatchDto)).resolves.toMatchObject({
      id: 1,
      code: 'L-000001',
      quantityInitial: 12,
      quantityAvailable: 12,
    });
    expect(typeMovementsRepository.findOne).toHaveBeenCalledWith({
      where: { name: 'ENTRADA', isActive: true },
    });
    expect(inventoryMovementsRepository.create).toHaveBeenCalledWith({
      quantity: 12,
      balancePrevius: 0,
      balanceCurrent: 12,
      date: createBatchDto.entryDate,
      observation: 'Entrada inicial del lote L-000001',
      batch: { id: 1 },
      typeMovement: { id: 6 },
    });
    expect(inventoryMovementsRepository.save).toHaveBeenCalledOnce();
  });

  it('does not create a batch if the ENTRADA movement type is missing', async () => {
    const batchRepository = {
      create: vi.fn((value) => value),
      save: vi.fn(async (value) => ({ id: 1, ...value })),
    };
    const inventoryMovementsRepository = {
      create: vi.fn((value) => value),
      save: vi.fn(),
    };
    const typeMovementsRepository = { findOne: vi.fn().mockResolvedValue(null) };
    repository.manager.transaction.mockImplementation((callback) =>
      callback({
        getRepository: (entity: typeof Batch | typeof InventoryMovement | typeof TypeMovement) => {
          if (entity === Batch) return batchRepository;
          if (entity === InventoryMovement) return inventoryMovementsRepository;
          return typeMovementsRepository;
        },
      }),
    );

    await expect(
      service.create({
        expirationDate: new Date('2026-02-01'),
        quantityInitial: 12,
        productId: 4,
        providerId: 5,
        observation: 'Test batch',
        imageUrl: 'batch.png',
      }),
    ).rejects.toThrow('ENTRADA');
    expect(inventoryMovementsRepository.save).not.toHaveBeenCalled();
  });

  it('requires a positive initial batch quantity', async () => {
    await expect(
      service.create({
        expirationDate: new Date('2026-02-01'),
        quantityInitial: 0,
        productId: 4,
        providerId: 5,
        observation: 'Test batch',
        imageUrl: 'batch.png',
      }),
    ).rejects.toThrow('mayor que cero');
    expect(repository.manager.transaction).not.toHaveBeenCalled();
  });

  it('finds a batch by id and throws when it does not exist', async () => {
    const batch = { id: 1, code: 'BATCH-1' };
    repository.findOne.mockResolvedValueOnce(batch).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(batch);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      relations: { product: true, provider: true },
    });
  });

  it('updates a batch', async () => {
    const batch = { id: 1, code: 'BATCH-1' } as Batch;
    const updatedBatch = { id: 1, code: 'BATCH-2' };
    repository.findOne.mockResolvedValueOnce(batch).mockResolvedValueOnce(updatedBatch);
    repository.merge.mockReturnValue(updatedBatch);
    repository.save.mockResolvedValue(updatedBatch);

    await expect(service.update(1, { code: 'BATCH-2' })).resolves.toBe(updatedBatch);
    expect(repository.merge).toHaveBeenCalledWith(batch, { code: 'BATCH-2' });
    expect(repository.save).toHaveBeenCalledWith(updatedBatch);
  });

  it('removes an existing batch', async () => {
    const batch = { id: 1, code: 'BATCH-1' } as Batch;
    repository.findOne.mockResolvedValue(batch);

    await expect(service.remove(1)).resolves.toEqual({
      success: true,
      message: 'Lote eliminado correctamente',
    });
    expect(repository.remove).toHaveBeenCalledWith(batch);
  });
});
