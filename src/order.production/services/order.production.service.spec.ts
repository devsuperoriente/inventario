import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderProductionService } from './order.production.service.js';
import { OrderProduction } from '../entities/order.production.entity.js';
import { Recipe } from '../../recipe/entities/recipe.entity.js';
import { RawMaterialConsumption } from '../../raw.material.consumption/entities/raw.material.consumption.entity.js';
import { Batch } from '../../batchs/entities/batch.entity.js';
import { InventoryMovement } from '../../inventory.movement/entities/inventory.movement.entity.js';
import { TypeMovement } from '../../inventory.movement/entities/type.movement.entity.js';

describe('OrderProductionService', () => {
  type ConsumptionOrderFixture = {
    id: number;
    numberOrder?: string;
    quantitySheduled?: string | number;
    state?: { name: string };
    product?: { id: number; category: { id: number } };
  };

  let service: OrderProductionService;
  let repository: {
    manager: { transaction: ReturnType<typeof vi.fn> };
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    merge: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let recipesRepository: {
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
  };
  const configureConsumptionTransaction = ({ order, batches = [], existingConsumptions = 0 }: { order: ConsumptionOrderFixture; batches?: Batch[]; existingConsumptions?: number }) => {
    const batchesQueryBuilder = {
      where: vi.fn().mockReturnThis(),
      andWhere: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      addOrderBy: vi.fn().mockReturnThis(),
      setLock: vi.fn().mockReturnThis(),
      getMany: vi.fn().mockResolvedValue(batches),
    };
    const batchRepository = {
      createQueryBuilder: vi.fn().mockReturnValue(batchesQueryBuilder),
      save: vi.fn(async (batch) => batch),
    };
    const consumptionsRepository = {
      count: vi.fn().mockResolvedValue(existingConsumptions),
      create: vi.fn((value) => value),
      save: vi.fn(async (value) => value),
    };
    const inventoryMovementsRepository = {
      create: vi.fn((value) => value),
      save: vi.fn(async (value) => value),
    };
    const typeMovementsRepository = {
      findOne: vi.fn().mockResolvedValue({ id: 8, name: 'SALIDA', isActive: true }),
    };
    const transactionOrderRepository = {
      findOne: vi.fn().mockResolvedValueOnce(order).mockResolvedValueOnce(order),
    };
    const manager = {
      getRepository: (entity: typeof OrderProduction | typeof Recipe | typeof RawMaterialConsumption | typeof Batch | typeof InventoryMovement | typeof TypeMovement) => {
        if (entity === OrderProduction) return transactionOrderRepository;
        if (entity === Recipe) return recipesRepository;
        if (entity === RawMaterialConsumption) return consumptionsRepository;
        if (entity === Batch) return batchRepository;
        if (entity === InventoryMovement) return inventoryMovementsRepository;
        return typeMovementsRepository;
      },
    };
    repository.manager.transaction.mockImplementation((callback) => callback(manager));
    return {
      batchesQueryBuilder,
      batchRepository,
      consumptionsRepository,
      inventoryMovementsRepository,
      typeMovementsRepository,
      transactionOrderRepository,
    };
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
    recipesRepository = {
      find: vi.fn(),
      findOne: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrderProductionService, { provide: getRepositoryToken(OrderProduction), useValue: repository }, { provide: getRepositoryToken(Recipe), useValue: recipesRepository }],
    }).compile();

    service = module.get<OrderProductionService>(OrderProductionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all production orders with their state and product', async () => {
    const orders = [{ id: 1, numberOrder: 'PROD-1' }];
    repository.find.mockResolvedValue(orders);

    await expect(service.findAll()).resolves.toBe(orders);
    expect(repository.find).toHaveBeenCalledWith({
      relations: { state: true, product: true, user: true },
    });
  });

  it('creates a production order with its state and product', async () => {
    const order = {
      id: 1,
      numberOrder: 'PROD-1',
      date: new Date('2026-10-15T10:00:00.000Z'),
      state: { id: 2 },
      product: { id: 3 },
    };
    const transactionRepository = {
      create: vi.fn(),
      save: vi.fn().mockResolvedValueOnce({ id: 1, numberOrder: 'TEMP' }).mockResolvedValueOnce(order),
    };
    repository.manager.transaction.mockImplementation(async (callback) => callback({ getRepository: () => transactionRepository }));

    await expect(
      service.create(
        {
          numberOrder: 'PROD-1',
          date: order.date,
          stateId: 2,
          productId: 3,
        },
        1,
      ),
    ).resolves.toBe(order);
    expect(transactionRepository.create).toHaveBeenCalledWith({
      numberOrder: 'TEMP',
      date: order.date,
      user: { id: 1 },
      state: { id: 2 },
      product: { id: 3 },
    });
  });

  it('finds a production order by id and throws when it does not exist', async () => {
    const order = { id: 1, numberOrder: 'PROD-1' };
    repository.findOne.mockResolvedValueOnce(order).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(order);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      relations: { state: true, product: { category: true } },
    });
  });

  it('calculates required materials without rounding decimal quantities', async () => {
    repository.findOne.mockResolvedValue({
      id: 7,
      quantitySheduled: '2.25',
      product: { id: 3, category: { id: 2, name: 'Producto Final' } },
    });
    recipesRepository.find.mockResolvedValue([
      {
        id: 5,
        code: 'R-000005',
        name: 'Masa',
        version: '2',
        baseYield: '1.5',
        detailsRecipe: [
          {
            id: 11,
            amount: '0.15',
            product: {
              id: 9,
              name: 'Harina',
              unitsMeasurement: { id: 1, name: 'GRAMO', abbreviation: 'g' },
            },
          },
        ],
      },
    ]);

    await expect(service.findRequiredMaterials(7)).resolves.toEqual({
      orden: expect.objectContaining({ id: 7 }),
      receta: { id: 5, code: 'R-000005', name: 'Masa', baseYield: '1.5' },
      insumos: [
        {
          id: 9,
          nombre: 'Harina',
          unidadMedida: { id: 1, nombre: 'GRAMO', abreviatura: 'g' },
          cantidadRequerida: '0.225',
        },
      ],
    });
  });

  it('rejects production orders whose product is not in category 2', async () => {
    repository.findOne.mockResolvedValue({
      id: 7,
      product: { id: 3, category: { id: 1, name: 'Producto Final' } },
    });

    await expect(service.findRequiredMaterials(7)).rejects.toThrow(UnprocessableEntityException);
    expect(recipesRepository.find).not.toHaveBeenCalled();
  });

  it('rejects multiple applicable recipes instead of choosing one', async () => {
    repository.findOne.mockResolvedValue({
      id: 7,
      quantitySheduled: '1',
      product: { id: 3, category: { id: 2, name: 'Producto Final' } },
    });
    recipesRepository.find.mockResolvedValue([
      { id: 5, name: 'Masa', version: '1' },
      { id: 6, name: 'Masa', version: '2' },
    ]);

    await expect(service.findRequiredMaterials(7)).rejects.toThrow(ConflictException);
  });

  it('reports when the order product has no applicable active recipe', async () => {
    repository.findOne.mockResolvedValue({
      id: 7,
      quantitySheduled: '1',
      product: { id: 3, category: { id: 2, name: 'Producto Final' } },
    });
    recipesRepository.find.mockResolvedValue([]);

    await expect(service.findRequiredMaterials(7)).rejects.toThrow(NotFoundException);
  });

  it('rejects invalid recipe detail quantities', async () => {
    repository.findOne.mockResolvedValue({
      id: 7,
      quantitySheduled: '1',
      product: { id: 3, category: { id: 2, name: 'Producto Final' } },
    });
    recipesRepository.find.mockResolvedValue([
      {
        id: 5,
        detailsRecipe: [{ id: 11, amount: '0', product: { id: 9, unitsMeasurement: { id: 1 } } }],
      },
    ]);

    await expect(service.findRequiredMaterials(7)).rejects.toThrow(UnprocessableEntityException);
  });

  it('consumes recipe materials by FEFO and records batch balances and exit movements', async () => {
    const order = {
      id: 7,
      numberOrder: 'OP-000007',
      quantitySheduled: '2',
      state: { name: 'EN DOSIFICACION' },
      product: { id: 3, category: { id: 2 } },
    };
    const earlierBatch = {
      id: 1,
      code: 'L-000001',
      quantityAvailable: '1.25',
    } as Batch;
    const laterBatch = {
      id: 2,
      code: 'L-000002',
      quantityAvailable: '3.00',
    } as Batch;
    const { batchRepository, consumptionsRepository, inventoryMovementsRepository, batchesQueryBuilder } = configureConsumptionTransaction({ order, batches: [earlierBatch, laterBatch] });
    recipesRepository.find.mockResolvedValue([
      {
        id: 5,
        code: 'R-000005',
        name: 'Masa',
        baseYield: '1',
        detailsRecipe: [
          {
            id: 11,
            amount: '1',
            product: {
              id: 9,
              name: 'Harina',
              unitsMeasurement: { id: 1, name: 'GRAMO', abbreviation: 'g' },
            },
          },
        ],
      },
    ]);

    await expect(service.consumeRequiredMaterials(7)).resolves.toEqual({
      orden: { id: 7, numberOrder: 'OP-000007' },
      receta: { id: 5, code: 'R-000005', name: 'Masa' },
      consumos: [
        {
          productoId: 9,
          producto: 'Harina',
          unidad: 'g',
          cantidadRequerida: '2',
          lotes: [
            {
              loteId: 1,
              codigoLote: 'L-000001',
              cantidadConsumida: '1.25',
              saldoAnterior: '1.25',
              saldoActual: '0',
            },
            {
              loteId: 2,
              codigoLote: 'L-000002',
              cantidadConsumida: '0.75',
              saldoAnterior: '3',
              saldoActual: '2.25',
            },
          ],
        },
      ],
    });
    expect(batchesQueryBuilder.setLock).toHaveBeenCalledWith('pessimistic_write');
    expect(batchesQueryBuilder.andWhere).toHaveBeenCalledWith('batch.expirationDate >= CURRENT_DATE');
    expect(batchesQueryBuilder.orderBy).toHaveBeenCalledWith('batch.expirationDate', 'ASC');
    expect(batchRepository.save).toHaveBeenCalledTimes(2);
    expect(earlierBatch.quantityAvailable).toBe('0');
    expect(laterBatch.quantityAvailable).toBe('2.25');
    expect(consumptionsRepository.save).toHaveBeenCalledTimes(2);
    expect(inventoryMovementsRepository.save).toHaveBeenCalledTimes(2);
    expect(inventoryMovementsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: '0.75',
        balancePrevius: '3',
        balanceCurrent: '2.25',
        batch: { id: 2 },
        ordersProduction: { id: 7 },
        typeMovement: { id: 8 },
      }),
    );
  });

  it('rejects insufficient stock without writing consumption or movement records', async () => {
    const order = {
      id: 7,
      quantitySheduled: '2',
      state: { name: 'EN DOSIFICACION' },
      product: { id: 3, category: { id: 2 } },
    };
    const { batchRepository, consumptionsRepository, inventoryMovementsRepository } = configureConsumptionTransaction({
      order,
      batches: [{ id: 1, code: 'L-000001', quantityAvailable: '1' } as Batch],
    });
    recipesRepository.find.mockResolvedValue([
      {
        id: 5,
        baseYield: '1',
        detailsRecipe: [
          {
            id: 11,
            amount: '1',
            product: {
              id: 9,
              name: 'Harina',
              unitsMeasurement: { id: 1, name: 'GRAMO', abbreviation: 'g' },
            },
          },
        ],
      },
    ]);

    await expect(service.consumeRequiredMaterials(7)).rejects.toThrow(/Inventario insuficiente de Harina/);
    expect(batchRepository.save).not.toHaveBeenCalled();
    expect(consumptionsRepository.save).not.toHaveBeenCalled();
    expect(inventoryMovementsRepository.save).not.toHaveBeenCalled();
  });

  it('rejects duplicate consumption attempts for the same order', async () => {
    const order = {
      id: 7,
      state: { name: 'EN DOSIFICACION' },
      product: { id: 3, category: { id: 2 } },
    };
    const { consumptionsRepository } = configureConsumptionTransaction({
      order,
      existingConsumptions: 1,
    });

    await expect(service.consumeRequiredMaterials(7)).rejects.toThrow(/ya tiene consumos/);
    expect(consumptionsRepository.count).toHaveBeenCalledWith({
      where: { ordersProduction: { id: 7 } },
    });
    expect(recipesRepository.find).not.toHaveBeenCalled();
  });

  it('only records consumption while the order is in dosing', async () => {
    const order = {
      id: 7,
      state: { name: 'APROBADA' },
      product: { id: 3, category: { id: 2 } },
    };
    configureConsumptionTransaction({ order });

    await expect(service.consumeRequiredMaterials(7)).rejects.toThrow(/EN DOSIFICACION/);
    expect(recipesRepository.find).not.toHaveBeenCalled();
  });

  it('updates a production order', async () => {
    const order = {
      id: 1,
      numberOrder: 'PROD-1',
      date: new Date('2026-10-15T10:00:00.000Z'),
      state: { id: 2 },
      product: { id: 3 },
    } as OrderProduction;
    const updatedOrder = { ...order, numberOrder: 'PROD-2', state: { id: 4 } };
    repository.findOne.mockResolvedValueOnce(order).mockResolvedValueOnce(updatedOrder);
    repository.merge.mockReturnValue(updatedOrder);
    repository.save.mockResolvedValue(updatedOrder);

    await expect(service.update(1, { numberOrder: 'PROD-2', stateId: 4 })).resolves.toBe(updatedOrder);
    expect(repository.merge).toHaveBeenCalledWith(order, {
      numberOrder: 'PROD-2',
      state: { id: 4 },
    });
    expect(repository.save).toHaveBeenCalledWith(updatedOrder);
  });

  it('removes an existing production order', async () => {
    const order = { id: 1, numberOrder: 'PROD-1' } as OrderProduction;
    repository.findOne.mockResolvedValue(order);

    await expect(service.remove(1)).resolves.toEqual({
      success: true,
      message: 'Orden de producción eliminada correctamente',
    });
    expect(repository.remove).toHaveBeenCalledWith(order);
  });
});
