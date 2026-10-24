import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecipeService } from './recipe.service.js';
import { Recipe } from '../entities/recipe.entity.js';
import { Product } from '../../products/entities/product.entity.js';

describe('RecipeService', () => {
  let service: RecipeService;
  let repository: {
    manager: { transaction: ReturnType<typeof vi.fn> };
    create: ReturnType<typeof vi.fn>;
    find: ReturnType<typeof vi.fn>;
    findOne: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    merge: ReturnType<typeof vi.fn>;
    remove: ReturnType<typeof vi.fn>;
  };
  let productsRepository: {
    findOne: ReturnType<typeof vi.fn>;
    findOneBy: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    repository = {
      manager: { transaction: vi.fn() },
      create: vi.fn(),
      find: vi.fn(),
      findOne: vi.fn(),
      save: vi.fn(),
      merge: vi.fn(),
      remove: vi.fn(),
    };
    productsRepository = {
      findOne: vi.fn(),
      findOneBy: vi.fn(),
      save: vi.fn(),
    };
    repository.manager.transaction.mockImplementation((callback) =>
      callback({
        getRepository: (entity: typeof Recipe | typeof Product) => (entity === Recipe ? repository : productsRepository),
      }),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [RecipeService, { provide: getRepositoryToken(Recipe), useValue: repository }],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all recipes', async () => {
    const recipes = [{ id: 1, codigo: 'R-1', name: 'Receta' }];
    repository.find.mockResolvedValue(recipes);

    await expect(service.findAll()).resolves.toBe(recipes);
    expect(repository.find).toHaveBeenCalledWith({ relations: { product: true } });
  });

  it('creates a recipe', async () => {
    const recipe = { name: 'Receta', description: 'Descripción', version: '1', productId: 3 };
    const product = { id: 3, category: { id: 2, name: 'Producto Final' }, recipe: null };
    const entity = {
      name: 'Receta',
      description: 'Descripción',
      version: '1',
      product,
    };
    const savedRecipe = { id: 1, ...entity, code: 'R-000001' };
    repository.create.mockReturnValue(entity);
    repository.save.mockResolvedValueOnce({ id: 1, ...entity }).mockResolvedValueOnce(savedRecipe);
    repository.findOne.mockResolvedValue(savedRecipe);
    productsRepository.findOne.mockResolvedValue(product);

    await expect(service.create(recipe)).resolves.toEqual(savedRecipe);
    expect(repository.create).toHaveBeenCalledWith(entity);
    expect(repository.save).toHaveBeenNthCalledWith(1, entity);
    expect(repository.create).toHaveBeenCalledWith({
      name: 'Receta',
      description: 'Descripción',
      version: '1',
      product,
    });
  });

  it('rejects creating a recipe for a product outside category 2', async () => {
    productsRepository.findOne.mockResolvedValue({
      id: 3,
      category: { id: 1, name: 'Producto Final' },
      recipe: null,
    });

    await expect(service.create({ name: 'Receta', description: '', version: '1', baseYield: 1, productId: 3 })).rejects.toThrow(BadRequestException);
  });

  it('finds a recipe by id and throws when it does not exist', async () => {
    const recipe = { id: 1, codigo: 'R-1', name: 'Receta' };
    repository.findOne.mockResolvedValueOnce(recipe).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(recipe);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, {
      where: { id: 1 },
      relations: { product: true },
    });
  });

  it('updates a recipe', async () => {
    const recipe = { id: 1, codigo: 'R-1', name: 'Receta' } as Recipe;
    const updatedRecipe = { id: 1, codigo: 'R-1', name: 'Receta actualizada' };
    repository.findOne.mockResolvedValueOnce(recipe).mockResolvedValueOnce(updatedRecipe);
    repository.merge.mockReturnValue(updatedRecipe);
    repository.save.mockResolvedValue(updatedRecipe);

    await expect(service.update(1, { name: 'Receta actualizada' })).resolves.toBe(updatedRecipe);
    expect(repository.merge).toHaveBeenCalledWith(recipe, { name: 'Receta actualizada' });
    expect(repository.save).toHaveBeenCalledWith(updatedRecipe);
  });

  it('removes an existing recipe', async () => {
    const recipe = { id: 1, codigo: 'R-1', name: 'Receta' } as Recipe;
    repository.findOne.mockResolvedValue(recipe);

    await expect(service.remove(1)).resolves.toEqual({
      success: true,
      message: 'Receta eliminada correctamente',
    });
    expect(repository.remove).toHaveBeenCalledWith(recipe);
  });
});
