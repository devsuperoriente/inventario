import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DetailsRecipeService } from './details.recipe.service.js';
import { DetailsRecipe } from '../entities/details.recipe.entity.js';

describe('DetailsRecipeService', () => {
  let service: DetailsRecipeService;
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
      providers: [DetailsRecipeService, { provide: getRepositoryToken(DetailsRecipe), useValue: repository }],
    }).compile();

    service = module.get<DetailsRecipeService>(DetailsRecipeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all recipe details', async () => {
    const details = [{ id: 1, amount: 12.5, observation: 'Preparación' }];
    repository.find.mockResolvedValue(details);

    await expect(service.findAll()).resolves.toBe(details);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates recipe details', async () => {
    const details = { amount: 12.5, observation: 'Preparación' };
    repository.save.mockResolvedValue({ id: 1, ...details });

    await expect(service.create(details)).resolves.toEqual({ id: 1, ...details });
    expect(repository.save).toHaveBeenCalledWith(details);
  });

  it('finds recipe details by id and throws when they do not exist', async () => {
    const details = { id: 1, amount: 12.5, observation: 'Preparación' };
    repository.findOne.mockResolvedValueOnce(details).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(details);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates recipe details', async () => {
    const details = { id: 1, amount: 12.5, observation: 'Preparación' } as DetailsRecipe;
    const updatedDetails = { id: 1, amount: 14, observation: 'Preparación actualizada' };
    repository.findOne.mockResolvedValue(details);
    repository.merge.mockReturnValue(updatedDetails);
    repository.save.mockResolvedValue(updatedDetails);

    await expect(service.update(1, { amount: 14 })).resolves.toBe(updatedDetails);
    expect(repository.merge).toHaveBeenCalledWith(details, { amount: 14 });
    expect(repository.save).toHaveBeenCalledWith(updatedDetails);
  });

  it('removes existing recipe details', async () => {
    const details = { id: 1, amount: 12.5, observation: 'Preparación' } as DetailsRecipe;
    repository.findOne.mockResolvedValue(details);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(details);
  });
});
