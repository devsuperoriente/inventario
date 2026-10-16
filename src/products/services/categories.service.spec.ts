import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CategorysService } from './categories.service.js';
import { Category } from '../entities/category.entity.js';

describe('CategorysService', () => {
  let service: CategorysService;
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
      providers: [CategorysService, { provide: getRepositoryToken(Category), useValue: repository }],
    }).compile();

    service = module.get<CategorysService>(CategorysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all categories', async () => {
    const categories = [{ id: 1, name: 'Bebidas' }];
    repository.find.mockResolvedValue(categories);

    await expect(service.findAll()).resolves.toBe(categories);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates a category', async () => {
    const category = { id: 1, name: 'Bebidas' };
    repository.save.mockResolvedValue(category);

    await expect(service.create({ name: 'Bebidas' })).resolves.toBe(category);
    expect(repository.save).toHaveBeenCalledWith({ name: 'Bebidas' });
  });

  it('finds a category by id and throws when it does not exist', async () => {
    const category = { id: 1, name: 'Bebidas' };
    repository.findOne.mockResolvedValueOnce(category).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(category);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates a category', async () => {
    const category = { id: 1, name: 'Bebidas' } as Category;
    const updatedCategory = { id: 1, name: 'Bebidas frías' };
    repository.findOne.mockResolvedValue(category);
    repository.merge.mockReturnValue(updatedCategory);
    repository.save.mockResolvedValue(updatedCategory);

    await expect(service.update(1, { name: 'Bebidas frías' })).resolves.toBe(updatedCategory);
    expect(repository.merge).toHaveBeenCalledWith(category, { name: 'Bebidas frías' });
    expect(repository.save).toHaveBeenCalledWith(updatedCategory);
  });

  it('removes an existing category', async () => {
    const category = { id: 1, name: 'Bebidas' } as Category;
    repository.findOne.mockResolvedValue(category);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(category);
  });
});
