import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { CreateProductDto } from '../dto/create-product.dto.js';
import { UpdateProductDto } from '../dto/update-product.dto.js';
import { Product } from '../entities/product.entity.js';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll() {
    return this.productsRepository.find({
      relations: {
        category: true,
        unitsMeasurement: true,
      },
    });
  }

  async findOne(id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: {
        category: true,
        unitsMeasurement: true,
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async findByName(name: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      // ILike busca sin distinguir mayúsculas y minúsculas.
      // Los símbolos '%' sirven para buscar coincidencias parciales (que contenga el texto).
      where: { name: ILike(`%${name}%`) },
    });

    if (!product) {
      throw new NotFoundException(`Producto con nombre "${name}" no encontrado`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    try {
      const product = await this.productsRepository.save({
        ...createProductDto,
        category: { id: createProductDto.categoryId },
        unitsMeasurement: { id: createProductDto.unitsMeasurementId },
        provider: { id: createProductDto.providerId },
      });
      return await this.productsRepository.findOne({ where: { id: product.id } });
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el producto');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.findOne(id);

      const { categoryId, unitsMeasurementId, providerId, ...productData } = updateProductDto;

      const updatedProduct = this.productsRepository.merge(product, productData);

      // Actualizar las relaciones solo si llegan en el DTO
      if (categoryId !== undefined) {
        updatedProduct.category = { id: categoryId } as any;
      }

      if (unitsMeasurementId !== undefined) {
        updatedProduct.unitsMeasurement = { id: unitsMeasurementId } as any;
      }

      await this.productsRepository.save(updatedProduct);

      // Retornar el producto actualizado con sus relaciones
      return await this.productsRepository.findOne({
        where: { id },
        relations: {
          category: true,
          unitsMeasurement: true,
        },
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }

      throw new UnprocessableEntityException('Error al actualizar el producto');
    }
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    try {
      await this.productsRepository.remove(product);
      return {
        success: true,
        message: 'Producto eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el producto');
    }
  }
}
