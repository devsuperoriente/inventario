import { Test, TestingModule } from '@nestjs/testing';
import { OrderProductionController } from './order.production.controller.js';
import { OrderProductionService } from '../services/order.production.service.js';

describe('OrderProductionController', () => {
  let controller: OrderProductionController;
  const consumeRequiredMaterials = vi.fn();

  beforeEach(async () => {
    vi.clearAllMocks();
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
            consumeRequiredMaterials,
          },
        },
      ],
    }).compile();

    controller = module.get<OrderProductionController>(OrderProductionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('registers material consumption for a production order', async () => {
    await controller.consumeRequiredMaterials(7);

    expect(consumeRequiredMaterials).toHaveBeenCalledWith(7);
  });
});
