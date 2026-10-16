import { Test, TestingModule } from '@nestjs/testing';
import { RawMaterialConsumptionController } from './raw.material.consumption.controller.js';
import { RawMaterialConsumptionService } from './raw.material.consumption.service.js';

describe('RawMaterialConsumptionController', () => {
  let controller: RawMaterialConsumptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RawMaterialConsumptionController],
      providers: [{ provide: RawMaterialConsumptionService, useValue: {} }],
    }).compile();

    controller = module.get<RawMaterialConsumptionController>(RawMaterialConsumptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
