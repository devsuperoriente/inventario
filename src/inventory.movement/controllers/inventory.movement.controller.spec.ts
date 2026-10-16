import { Test, TestingModule } from '@nestjs/testing';
import { InventoryMovementController } from './inventory.movement.controller.js';
import { InventoryMovementService } from '../services/inventory.movement.service.js';

describe('InventoryMovementController', () => {
  let controller: InventoryMovementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryMovementController],
      providers: [{ provide: InventoryMovementService, useValue: {} }],
    }).compile();

    controller = module.get<InventoryMovementController>(InventoryMovementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
