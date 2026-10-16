import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RecipeService } from './recipe.service.js';
import { Recipe } from '../entities/recipe.entity.js';

describe('RecipeService', () => {
  let service: RecipeService;
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
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates a recipe', async () => {
    const recipe = { codigo: 'R-1', name: 'Receta', description: 'Descripción', version: '1' };
    repository.save.mockResolvedValue({ id: 1, ...recipe });

    await expect(service.create(recipe)).resolves.toEqual({ id: 1, ...recipe });
    expect(repository.save).toHaveBeenCalledWith(recipe);
  });

  it('finds a recipe by id and throws when it does not exist', async () => {
    const recipe = { id: 1, codigo: 'R-1', name: 'Receta' };
    repository.findOne.mockResolvedValueOnce(recipe).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(recipe);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates a recipe', async () => {
    const recipe = { id: 1, codigo: 'R-1', name: 'Receta' } as Recipe;
    const updatedRecipe = { id: 1, codigo: 'R-1', name: 'Receta actualizada' };
    repository.findOne.mockResolvedValue(recipe);
    repository.merge.mockReturnValue(updatedRecipe);
    repository.save.mockResolvedValue(updatedRecipe);

    await expect(service.update(1, { name: 'Receta actualizada' })).resolves.toBe(updatedRecipe);
    expect(repository.merge).toHaveBeenCalledWith(recipe, { name: 'Receta actualizada' });
    expect(repository.save).toHaveBeenCalledWith(updatedRecipe);
  });

  it('removes an existing recipe', async () => {
    const recipe = { id: 1, codigo: 'R-1', name: 'Receta' } as Recipe;
    repository.findOne.mockResolvedValue(recipe);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(recipe);
  });
});
