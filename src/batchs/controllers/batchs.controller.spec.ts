import { Test, TestingModule } from '@nestjs/testing';
import { BatchsController } from './batchs.controller.js';
import { BatchsService } from './batchs.service.js';

describe('BatchsController', () => {
  let controller: BatchsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchsController],
      providers: [{ provide: BatchsService, useValue: {} }],
    }).compile();

    controller = module.get<BatchsController>(BatchsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
