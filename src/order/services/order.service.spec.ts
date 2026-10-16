import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { OrderService } from './order.service.js';
import { Order } from '../entities/order.entity.js';

describe('OrderService', () => {
  let service: OrderService;
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
      providers: [OrderService, { provide: getRepositoryToken(Order), useValue: repository }],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all orders', async () => {
    const orders = [{ id: 1, numberOrder: 'ORD-1', dateOrder: new Date() }];
    repository.find.mockResolvedValue(orders);

    await expect(service.findAll()).resolves.toBe(orders);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates an order', async () => {
    const order = { numberOrder: 'ORD-1', dateOrder: '2026-10-15T10:00:00.000Z' };
    repository.save.mockResolvedValue({ id: 1, ...order });

    await expect(service.create(order)).resolves.toEqual({ id: 1, ...order });
    expect(repository.save).toHaveBeenCalledWith(order);
  });

  it('finds an order by id and throws when it does not exist', async () => {
    const order = { id: 1, numberOrder: 'ORD-1', dateOrder: new Date() };
    repository.findOne.mockResolvedValueOnce(order).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(order);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates an order', async () => {
    const order = { id: 1, numberOrder: 'ORD-1', dateOrder: new Date() } as Order;
    const updatedOrder = { id: 1, numberOrder: 'ORD-2', dateOrder: order.dateOrder };
    repository.findOne.mockResolvedValue(order);
    repository.merge.mockReturnValue(updatedOrder);
    repository.save.mockResolvedValue(updatedOrder);

    await expect(service.update(1, { numberOrder: 'ORD-2' })).resolves.toBe(updatedOrder);
    expect(repository.merge).toHaveBeenCalledWith(order, { numberOrder: 'ORD-2' });
    expect(repository.save).toHaveBeenCalledWith(updatedOrder);
  });

  it('removes an existing order', async () => {
    const order = { id: 1, numberOrder: 'ORD-1', dateOrder: new Date() } as Order;
    repository.findOne.mockResolvedValue(order);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(order);
  });
});
