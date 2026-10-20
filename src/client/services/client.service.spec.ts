import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ClientService } from './client.service.js';
import { Client } from './entities/client.entity.js';

describe('ClientService', () => {
  let service: ClientService;
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
      providers: [ClientService, { provide: getRepositoryToken(Client), useValue: repository }],
    }).compile();

    service = module.get<ClientService>(ClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all clients', async () => {
    const clients = [{ id: 1, name: 'Cliente', nit: '123' }];
    repository.find.mockResolvedValue(clients);

    await expect(service.findAll()).resolves.toBe(clients);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates a client', async () => {
    const client = { name: 'Cliente', nit: '123', email: 'cliente@example.com' };
    repository.save.mockResolvedValue({ id: 1, ...client });

    await expect(service.create(client)).resolves.toEqual({ id: 1, ...client });
    expect(repository.save).toHaveBeenCalledWith(client);
  });

  it('finds a client by id and throws when it does not exist', async () => {
    const client = { id: 1, name: 'Cliente', nit: '123' };
    repository.findOne.mockResolvedValueOnce(client).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(client);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates a client', async () => {
    const client = { id: 1, name: 'Cliente', nit: '123' } as Client;
    const updatedClient = { id: 1, name: 'Cliente actualizado', nit: '123' };
    repository.findOne.mockResolvedValue(client);
    repository.merge.mockReturnValue(updatedClient);
    repository.save.mockResolvedValue(updatedClient);

    await expect(service.update(1, { name: 'Cliente actualizado' })).resolves.toBe(updatedClient);
    expect(repository.merge).toHaveBeenCalledWith(client, { name: 'Cliente actualizado' });
    expect(repository.save).toHaveBeenCalledWith(updatedClient);
  });

  it('removes an existing client', async () => {
    const client = { id: 1, name: 'Cliente', nit: '123' } as Client;
    repository.findOne.mockResolvedValue(client);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(client);
  });
});
