import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DetailsOrderService } from './details.order.service.js';
import { DetailsOrder } from '../entities/details.order.entity.js';

describe('DetailsOrderService', () => {
  let service: DetailsOrderService;
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
      providers: [DetailsOrderService, { provide: getRepositoryToken(DetailsOrder), useValue: repository }],
    }).compile();

    service = module.get<DetailsOrderService>(DetailsOrderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all order details', async () => {
    const details = [{ id: 1, amount: 2, price: 10, subtotal: 20 }];
    repository.find.mockResolvedValue(details);

    await expect(service.findAll()).resolves.toBe(details);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates order details', async () => {
    const details = { amount: 2, price: 10, subtotal: 20 };
    repository.save.mockResolvedValue({ id: 1, ...details });

    await expect(service.create(details)).resolves.toEqual({ id: 1, ...details });
    expect(repository.save).toHaveBeenCalledWith(details);
  });

  it('finds order details by id and throws when they do not exist', async () => {
    const details = { id: 1, amount: 2, price: 10, subtotal: 20 };
    repository.findOne.mockResolvedValueOnce(details).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(details);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates order details', async () => {
    const details = { id: 1, amount: 2, price: 10, subtotal: 20 } as DetailsOrder;
    const updatedDetails = { id: 1, amount: 3, price: 10, subtotal: 30 };
    repository.findOne.mockResolvedValue(details);
    repository.merge.mockReturnValue(updatedDetails);
    repository.save.mockResolvedValue(updatedDetails);

    await expect(service.update(1, { amount: 3, subtotal: 30 })).resolves.toBe(updatedDetails);
    expect(repository.merge).toHaveBeenCalledWith(details, { amount: 3, subtotal: 30 });
    expect(repository.save).toHaveBeenCalledWith(updatedDetails);
  });

  it('removes existing order details', async () => {
    const details = { id: 1, amount: 2, price: 10, subtotal: 20 } as DetailsOrder;
    repository.findOne.mockResolvedValue(details);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(details);
  });
});
