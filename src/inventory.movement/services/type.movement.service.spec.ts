import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TypeMovementService } from './type.movement.service.js';
import { TypeMovement } from '../entities/type.movement.entity.js';

describe('TypeMovementService', () => {
  let service: TypeMovementService;
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
      providers: [TypeMovementService, { provide: getRepositoryToken(TypeMovement), useValue: repository }],
    }).compile();

    service = module.get<TypeMovementService>(TypeMovementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all movement types', async () => {
    const types = [{ id: 1, name: 'Entrada', isActive: true }];
    repository.find.mockResolvedValue(types);

    await expect(service.findAll()).resolves.toBe(types);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates a movement type', async () => {
    const typeMovement = { id: 1, name: 'Entrada', isActive: true };
    const createDto = { name: 'Entrada' };
    repository.save.mockResolvedValue(typeMovement);

    await expect(service.create(createDto)).resolves.toBe(typeMovement);
    expect(repository.save).toHaveBeenCalledWith(createDto);
  });

  it('finds a movement type by id and throws when it does not exist', async () => {
    const typeMovement = { id: 1, name: 'Entrada', isActive: true };
    repository.findOne.mockResolvedValueOnce(typeMovement).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(typeMovement);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates a movement type', async () => {
    const typeMovement = { id: 1, name: 'Entrada', isActive: true } as TypeMovement;
    const updatedTypeMovement = { id: 1, name: 'Ingreso', isActive: true };
    repository.findOne.mockResolvedValue(typeMovement);
    repository.merge.mockReturnValue(updatedTypeMovement);
    repository.save.mockResolvedValue(updatedTypeMovement);

    await expect(service.update(1, { name: 'Ingreso' })).resolves.toBe(updatedTypeMovement);
    expect(repository.merge).toHaveBeenCalledWith(typeMovement, { name: 'Ingreso' });
    expect(repository.save).toHaveBeenCalledWith(updatedTypeMovement);
  });

  it('removes an existing movement type', async () => {
    const typeMovement = { id: 1, name: 'Entrada', isActive: true } as TypeMovement;
    repository.findOne.mockResolvedValue(typeMovement);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(typeMovement);
  });
});
