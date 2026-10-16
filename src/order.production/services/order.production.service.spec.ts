import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderProductionService } from './order.production.service.js';
import { OrderProduction } from '../entities/order.production.entity.js';

describe('OrderProductionService', () => {
  let service: OrderProductionService;
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
      providers: [OrderProductionService, { provide: getRepositoryToken(OrderProduction), useValue: repository }],
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
      relations: { state: true, product: true },
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
    repository.save.mockResolvedValue({ id: 1 });
    repository.findOne.mockResolvedValue(order);

    await expect(
      service.create({
        numberOrder: 'PROD-1',
        date: order.date,
        stateId: 2,
        productId: 3,
      }),
    ).resolves.toBe(order);
    expect(repository.save).toHaveBeenCalledWith({
      numberOrder: 'PROD-1',
      date: order.date,
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
      relations: { state: true, product: true },
    });
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

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(order);
  });
});
