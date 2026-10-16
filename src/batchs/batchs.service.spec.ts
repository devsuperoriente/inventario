import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BatchsService } from './batchs.service.js';
import { Batch } from './entities/batch.entity.js';

describe('BatchsService', () => {
  let service: BatchsService;
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
      providers: [BatchsService, { provide: getRepositoryToken(Batch), useValue: repository }],
    }).compile();

    service = module.get<BatchsService>(BatchsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all batches', async () => {
    const batches = [{ id: 1, code: 'BATCH-1' }];
    repository.find.mockResolvedValue(batches);

    await expect(service.findAll()).resolves.toBe(batches);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates a batch', async () => {
    const batch = { id: 1, code: 'BATCH-1' };
    const createBatchDto = {
      code: 'BATCH-1',
      date: new Date('2026-01-01'),
      dateMatury: new Date('2026-02-01'),
      observation: 'Test batch',
      image: 'batch.png',
    };
    repository.save.mockResolvedValue(batch);

    await expect(service.create(createBatchDto)).resolves.toBe(batch);
    expect(repository.save).toHaveBeenCalledWith(createBatchDto);
  });

  it('finds a batch by id and throws when it does not exist', async () => {
    const batch = { id: 1, code: 'BATCH-1' };
    repository.findOne.mockResolvedValueOnce(batch).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(batch);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates a batch', async () => {
    const batch = { id: 1, code: 'BATCH-1' } as Batch;
    const updatedBatch = { id: 1, code: 'BATCH-2' };
    repository.findOne.mockResolvedValue(batch);
    repository.merge.mockReturnValue(updatedBatch);
    repository.save.mockResolvedValue(updatedBatch);

    await expect(service.update(1, { code: 'BATCH-2' })).resolves.toBe(updatedBatch);
    expect(repository.merge).toHaveBeenCalledWith(batch, { code: 'BATCH-2' });
    expect(repository.save).toHaveBeenCalledWith(updatedBatch);
  });

  it('removes an existing batch', async () => {
    const batch = { id: 1, code: 'BATCH-1' } as Batch;
    repository.findOne.mockResolvedValue(batch);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(batch);
  });
});
