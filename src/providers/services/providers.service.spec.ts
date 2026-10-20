import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProvidersService } from './providers.service.js';
import { Provider } from '../products/entities/provider.entity.js';

describe('ProvidersService', () => {
  let service: ProvidersService;
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
      providers: [ProvidersService, { provide: getRepositoryToken(Provider), useValue: repository }],
    }).compile();

    service = module.get<ProvidersService>(ProvidersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all providers', async () => {
    const providers = [{ id: 1, name: 'Acme', nit: '123' }];
    repository.find.mockResolvedValue(providers);

    await expect(service.findAll()).resolves.toBe(providers);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates a provider', async () => {
    const provider = { id: 1, name: 'Acme', nit: '123' };
    repository.save.mockResolvedValue(provider);

    await expect(service.create({ name: 'Acme', nit: '123' })).resolves.toBe(provider);
    expect(repository.save).toHaveBeenCalledWith({ name: 'Acme', nit: '123' });
  });

  it('finds a provider by id and throws when it does not exist', async () => {
    const provider = { id: 1, name: 'Acme', nit: '123' };
    repository.findOne.mockResolvedValueOnce(provider).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(provider);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates a provider', async () => {
    const provider = { id: 1, name: 'Acme', nit: '123' } as Provider;
    const updatedProvider = { id: 1, name: 'Acme Ltd', nit: '123' };
    repository.findOne.mockResolvedValue(provider);
    repository.merge.mockReturnValue(updatedProvider);
    repository.save.mockResolvedValue(updatedProvider);

    await expect(service.update(1, { name: 'Acme Ltd' })).resolves.toBe(updatedProvider);
    expect(repository.merge).toHaveBeenCalledWith(provider, { name: 'Acme Ltd' });
    expect(repository.save).toHaveBeenCalledWith(updatedProvider);
  });

  it('removes an existing provider', async () => {
    const provider = { id: 1, name: 'Acme', nit: '123' } as Provider;
    repository.findOne.mockResolvedValue(provider);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(provider);
  });
});
