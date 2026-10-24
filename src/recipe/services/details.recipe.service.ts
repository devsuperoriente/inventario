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
      relations: {
        product: {
          unitsMeasurement: true,
        },
        recipe: true,
      },
    });
  }

  async findOne(id: number) {
    const detailsRecipe = await this.detailsRecipeRepository.findOne({
      where: { id },
      relations: {
        product: true,
        recipe: true,
      },
    });
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
        product: { id: createDetailsRecipeDto.productId },
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
    try {
      const detailsRecipe = await this.findOne(id);

      const { productId, recipeId, ...detailData } = updateDetailsRecipeDto;

      const updatedDetailOrder = this.detailsRecipeRepository.merge(detailsRecipe, detailData);

      // Actualizar las relaciones solo si llegan en el DTO
      if (productId !== undefined) {
        updatedDetailOrder.product = { id: productId } as any;
      }

      if (recipeId !== undefined) {
        updatedDetailOrder.recipe = { id: recipeId } as any;
      }

      await this.detailsRecipeRepository.save(updatedDetailOrder);

      // Retornar el producto actualizado con sus relaciones
      return await this.detailsRecipeRepository.findOne({
        where: { id },
        relations: {
          product: true,
          recipe: true,
        },
      });
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
      return {
        success: true,
        message: 'Detalle de receta eliminada  correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el detalle de la receta');
    }
  }
}
