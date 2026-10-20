import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetailsRecipeDto } from '../dto/create-details.recipe.dto.js';
import { UpdateDetailsRecipeDto } from '../dto/update-details.recipe.dto.js';
import { DetailsRecipe } from '../entities/details.recipe.entity.js';

@Injectable()
export class DetailsRecipeService {
  constructor(
    @InjectRepository(DetailsRecipe)
    private readonly detailsRecipeRepository: Repository<DetailsRecipe>,
  ) {}

  findAll() {
    return this.detailsRecipeRepository.find({
      relations : {
        product:true,
        recipe: true
      }
    });
  }

  async findOne(id: number) {
    const detailsRecipe = await this.detailsRecipeRepository.findOne({ where: { id } });
    if (!detailsRecipe) {
      throw new NotFoundException(`Recipe details with ID ${id} not found`);
    }
    return detailsRecipe;
  }

  async create(createDetailsRecipeDto: CreateDetailsRecipeDto) {
    try {
      const orderProduction = await this.detailsRecipeRepository.save({
        ...createDetailsRecipeDto,
        recipe: { id: createDetailsRecipeDto.recipeId },
        product : { id: createDetailsRecipeDto.productId }
      });
      return await this.findOne(orderProduction.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el detalle de receta');
    }
  }

  async update(id: number, updateDetailsRecipeDto: UpdateDetailsRecipeDto) {
    const detailsRecipe = await this.findOne(id);
    try {
      const updatedDetailsRecipe = this.detailsRecipeRepository.merge(detailsRecipe, updateDetailsRecipeDto);
      return await this.detailsRecipeRepository.save(updatedDetailsRecipe);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el detalle de la receta');
    }
  }

  async remove(id: number) {
    const detailsRecipe = await this.findOne(id);
    try {
      await this.detailsRecipeRepository.remove(detailsRecipe);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el detalle de la receta');
    }
  }
}
