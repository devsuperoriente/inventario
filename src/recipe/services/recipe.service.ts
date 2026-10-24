import { BadRequestException, ConflictException, HttpException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeDto } from '../dto/create-recipe.dto.js';
import { UpdateRecipeDto } from '../dto/update-recipe.dto.js';
import { Recipe } from '../entities/recipe.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipesRepository: Repository<Recipe>,
  ) {}

  findAll() {
    return this.recipesRepository.find({ relations: { product: true } });
  }

  async findOne(id: number) {
    const recipe = await this.recipesRepository.findOne({ where: { id }, relations: { product: true } });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    return recipe;
  }

  async create(createRecipeDto: CreateRecipeDto) {
    try {
      const { productId, ...recipeFields } = createRecipeDto;
      return await this.recipesRepository.manager.transaction(async (manager) => {
        const recipesRepository = manager.getRepository(Recipe);
        const productsRepository = manager.getRepository(Product);
        const product = await productsRepository.findOne({
          where: { id: productId },
          relations: { recipe: true, category: true },
        });
        if (!product) {
          throw new NotFoundException(`Product with ID ${productId} not found`);
        }
        if (product.category.id !== 2) {
          throw new BadRequestException(`Product ${productId} must have category ID 2`);
        }
        if (product.recipe) {
          throw new ConflictException(`Product ${productId} already has a recipe`);
        }

        const recipe = recipesRepository.create({ ...recipeFields, product });
        const savedRecipe = await recipesRepository.save(recipe);
        savedRecipe.code = `R-${String(savedRecipe.id).padStart(6, '0')}`;
        await recipesRepository.save(savedRecipe);
        return recipesRepository.findOne({
          where: { id: savedRecipe.id },
          relations: { product: true },
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Error al crear la receta');
    }
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.findOne(id);
    try {
      const { productId, ...recipeFields } = updateRecipeDto;
      return await this.recipesRepository.manager.transaction(async (manager) => {
        const recipesRepository = manager.getRepository(Recipe);
        const productsRepository = manager.getRepository(Product);
        const updatedRecipe = recipesRepository.merge(recipe, recipeFields);
        if (productId !== undefined && productId !== recipe.product?.id) {
          const product = await productsRepository.findOne({
            where: { id: productId },
            relations: { recipe: true, category: true },
          });
          if (!product) {
            throw new NotFoundException(`Product with ID ${productId} not found`);
          }
          if (product.category.id !== 2) {
            throw new BadRequestException(`Product ${productId} must have category ID 2`);
          }
          if (product.recipe) {
            throw new ConflictException(`Product ${productId} already has a recipe`);
          }
          updatedRecipe.product = product;
        }

        await recipesRepository.save(updatedRecipe);
        return recipesRepository.findOne({
          where: { id },
          relations: { product: true },
        });
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error instanceof HttpException) {
          throw error;
        }
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar la receta');
    }
  }

  async remove(id: number) {
    const recipe = await this.findOne(id);
    try {
      await this.recipesRepository.remove(recipe);
      return {
        success: true,
        message: 'Receta eliminada correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar la receta');
    }
  }
}
