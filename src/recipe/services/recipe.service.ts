import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRecipeDto } from '../dto/create-recipe.dto.js';
import { UpdateRecipeDto } from '../dto/update-recipe.dto.js';
import { Recipe } from '../entities/recipe.entity.js';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    private readonly recipesRepository: Repository<Recipe>,
  ) {}

  findAll() {
    return this.recipesRepository.find();
  }

  async findOne(id: number) {
    const recipe = await this.recipesRepository.findOne({ where: { id } });
    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }
    return recipe;
  }

  async create(createRecipeDto: CreateRecipeDto) {
    try {
      return await this.recipesRepository.save(createRecipeDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear la receta');
    }
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {
    const recipe = await this.findOne(id);
    try {
      const updatedRecipe = this.recipesRepository.merge(recipe, updateRecipeDto);
      return await this.recipesRepository.save(updatedRecipe);
    } catch (error) {
      if (error instanceof Error) {
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
