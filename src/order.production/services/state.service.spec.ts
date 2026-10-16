import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { StateService } from '../state/state.service.js';
import { State } from '../entities/state.entity.js';

describe('StateService', () => {
  let service: StateService;
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
      providers: [StateService, { provide: getRepositoryToken(State), useValue: repository }],
    }).compile();

    service = module.get<StateService>(StateService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all states', async () => {
    const states = [{ id: 1, name: 'Activo', isActive: true }];
    repository.find.mockResolvedValue(states);

    await expect(service.findAll()).resolves.toBe(states);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates a state', async () => {
    const state = { name: 'Activo', isActive: true };
    repository.save.mockResolvedValue({ id: 1, ...state });

    await expect(service.create(state)).resolves.toEqual({ id: 1, ...state });
    expect(repository.save).toHaveBeenCalledWith(state);
  });

  it('finds a state by id and throws when it does not exist', async () => {
    const state = { id: 1, name: 'Activo', isActive: true };
    repository.findOne.mockResolvedValueOnce(state).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(state);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates a state', async () => {
    const state = { id: 1, name: 'Activo', isActive: true } as State;
    const updatedState = { id: 1, name: 'Inactivo', isActive: false };
    repository.findOne.mockResolvedValue(state);
    repository.merge.mockReturnValue(updatedState);
    repository.save.mockResolvedValue(updatedState);

    await expect(service.update(1, { name: 'Inactivo', isActive: false })).resolves.toBe(updatedState);
    expect(repository.merge).toHaveBeenCalledWith(state, { name: 'Inactivo', isActive: false });
    expect(repository.save).toHaveBeenCalledWith(updatedState);
  });

  it('removes an existing state', async () => {
    const state = { id: 1, name: 'Activo', isActive: true } as State;
    repository.findOne.mockResolvedValue(state);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(state);
  });
});
