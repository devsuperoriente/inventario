import { Test, TestingModule } from '@nestjs/testing';
import { DetailsRecipeController } from './details.recipe.controller.js';
import { DetailsRecipeService } from '../services/details.recipe.service.js';

describe('DetailsRecipeController', () => {
  let controller: DetailsRecipeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DetailsRecipeController],
      providers: [
        {
          provide: DetailsRecipeService,
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

    controller = module.get<DetailsRecipeController>(DetailsRecipeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
