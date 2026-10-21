import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';
import { Category } from '../entities/category.entity.js';

@Injectable()
export class CategorysService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll() {
    return this.categoriesRepository.find();
  }

  async findOne(id: number) {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      return await this.categoriesRepository.save(createCategoryDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear la categoría');
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.findOne(id);
      const updatedCategory = this.categoriesRepository.merge(category, updateCategoryDto);
      return await this.categoriesRepository.save(updatedCategory);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar la categoría');
    }
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    try {
      await this.categoriesRepository.remove(category);
      return {
        success: true,
        message: 'Categoria eliminada correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar la categoría');
    }
  }
}
