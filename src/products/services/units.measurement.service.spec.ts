import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnitsMeasurementService } from './units.measurement.service.js';
import { UnitsMeasurement } from '../entities/units.measurement.entity.js';

describe('UnitsMeasurementService', () => {
  let service: UnitsMeasurementService;
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
      providers: [UnitsMeasurementService, { provide: getRepositoryToken(UnitsMeasurement), useValue: repository }],
    }).compile();

    service = module.get<UnitsMeasurementService>(UnitsMeasurementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('finds all units of measurement', async () => {
    const units = [{ id: 1, name: 'Kilogramo', abbreviation: 'kg', description: 'Masa' }];
    repository.find.mockResolvedValue(units);

    await expect(service.findAll()).resolves.toBe(units);
    expect(repository.find).toHaveBeenCalledWith();
  });

  it('creates a unit of measurement', async () => {
    const unit = { id: 1, name: 'Kilogramo', abbreviation: 'kg', description: 'Masa' };
    repository.save.mockResolvedValue(unit);

    await expect(service.create({ name: 'Kilogramo', abbreviation: 'kg', description: 'Masa' })).resolves.toBe(unit);
    expect(repository.save).toHaveBeenCalledWith({
      name: 'Kilogramo',
      abbreviation: 'kg',
      description: 'Masa',
    });
  });

  it('finds a unit by id and throws when it does not exist', async () => {
    const unit = { id: 1, name: 'Kilogramo', abbreviation: 'kg', description: 'Masa' };
    repository.findOne.mockResolvedValueOnce(unit).mockResolvedValueOnce(null);

    await expect(service.findOne(1)).resolves.toBe(unit);
    await expect(service.findOne(2)).rejects.toThrow(NotFoundException);
    expect(repository.findOne).toHaveBeenNthCalledWith(1, { where: { id: 1 } });
  });

  it('updates a unit of measurement', async () => {
    const unit = {
      id: 1,
      name: 'Kilogramo',
      abbreviation: 'kg',
      description: 'Masa',
    } as UnitsMeasurement;
    const updatedUnit = {
      id: 1,
      name: 'Gramo',
      abbreviation: 'kg',
      description: 'Masa',
    };
    repository.findOne.mockResolvedValue(unit);
    repository.merge.mockReturnValue(updatedUnit);
    repository.save.mockResolvedValue(updatedUnit);

    await expect(service.update(1, { name: 'Gramo' })).resolves.toBe(updatedUnit);
    expect(repository.merge).toHaveBeenCalledWith(unit, { name: 'Gramo' });
    expect(repository.save).toHaveBeenCalledWith(updatedUnit);
  });

  it('removes an existing unit of measurement', async () => {
    const unit = {
      id: 1,
      name: 'Kilogramo',
      abbreviation: 'kg',
      description: 'Masa',
    } as UnitsMeasurement;
    repository.findOne.mockResolvedValue(unit);

    await expect(service.remove(1)).resolves.toBeUndefined();
    expect(repository.remove).toHaveBeenCalledWith(unit);
  });
});
