import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProductsService } from './products.service.js';
import { Product } from '../entities/product.entity.js';

describe('ProductsService', () => {
  let service: ProductsService;
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
      providers: [ProductsService, { provide: getRepositoryToken(Product), useValue: repository }],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all products', async () => {
    const products = [{ id: 1, name: 'Producto', code: 'P-1' }];
    repository.find.mockResolvedValue(products);

    await expect(service.findAll()).resolves.toBe(products);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates a product', async () => {
    const product = {
      id: 1,
      name: 'Producto',
      code: 'P-1',
      priceBeforeTax: 10,
      priceAfterTax: 12,
      tax: 2,
      stockMin: 5,
      categoryId: 1,
      unitsMeasurementId: 1,
    };
    repository.save.mockResolvedValue(product);

    await expect(service.create(product)).resolves.toBe(product);
    expect(repository.save).toHaveBeenCalledWith(product);
  });

  it('finds a product by id and throws when it does not exist', async () => {
    const product = { id: 1, name: 'Producto', code: 'P-1' };
    repository.findOne.mockResolvedValueOnce(product).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(product);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates a product', async () => {
    const product = { id: 1, name: 'Producto', code: 'P-1' } as Product;
    const updatedProduct = { id: 1, name: 'Producto actualizado', code: 'P-1' };
    repository.findOne.mockResolvedValue(product);
    repository.merge.mockReturnValue(updatedProduct);
    repository.save.mockResolvedValue(updatedProduct);

    await expect(service.update(1, { name: 'Producto actualizado' })).resolves.toBe(updatedProduct);
    expect(repository.merge).toHaveBeenCalledWith(product, { name: 'Producto actualizado' });
    expect(repository.save).toHaveBeenCalledWith(updatedProduct);
  });

  it('removes an existing product', async () => {
    const product = { id: 1, name: 'Producto', code: 'P-1' } as Product;
    repository.findOne.mockResolvedValue(product);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(product);
  });
});
