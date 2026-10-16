import { Test, TestingModule } from '@nestjs/testing';
import { UnitsMeasurementController } from './units.measurement.controller.js';
import { UnitsMeasurementService } from '../services/units.measurement.service.js';

describe('UnitsMeasurementController', () => {
  let controller: UnitsMeasurementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UnitsMeasurementController],
      providers: [
        {
          provide: UnitsMeasurementService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            findOne: vi.fn(),
            update: vi.fn(),
            remove: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UnitsMeasurementController>(UnitsMeasurementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
