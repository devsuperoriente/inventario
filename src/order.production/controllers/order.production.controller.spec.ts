import { Test, TestingModule } from '@nestjs/testing';
import { OrderProductionController } from './order.production.controller.js';
import { OrderProductionService } from '../services/order.production.service.js';

describe('OrderProductionController', () => {
  let controller: OrderProductionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderProductionController],
      providers: [
        {
          provide: OrderProductionService,
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

    controller = module.get<OrderProductionController>(OrderProductionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
