import { Test, TestingModule } from '@nestjs/testing';
import { DetailsOrderController } from './details.order.controller.js';
import { DetailsOrderService } from '../services/details.order.service.js';

describe('DetailsOrderController', () => {
  let controller: DetailsOrderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetailsOrderController],
      providers: [
        {
          provide: DetailsOrderService,
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

    controller = module.get<DetailsOrderController>(DetailsOrderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
