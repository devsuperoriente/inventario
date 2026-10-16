import { Test, TestingModule } from '@nestjs/testing';
import { TypeMovementController } from './type.movement.controller.js';
import { TypeMovementService } from '../services/type.movement.service.js';

describe('TypeMovementController', () => {
  let controller: TypeMovementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeMovementController],
      providers: [{ provide: TypeMovementService, useValue: {} }],
    }).compile();

    controller = module.get<TypeMovementController>(TypeMovementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
