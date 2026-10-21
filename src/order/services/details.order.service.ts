import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDetailsOrderDto } from '../dto/create-details.order.dto.js';
import { UpdateDetailsOrderDto } from '../dto/update-details.order.dto.js';
import { DetailsOrder } from '../entities/details.order.entity.js';

@Injectable()
export class DetailsOrderService {
  constructor(
    @InjectRepository(DetailsOrder)
    private readonly detailsOrderRepository: Repository<DetailsOrder>,
  ) {}

  findAll() {
    return this.detailsOrderRepository.find({
      relations: {
        product:true,
        order:true
      }
    });
  }

  async findOne(id: number) {
    const detailsOrder = await this.detailsOrderRepository.findOne({
      where: { id },
      relations: {
        product:true,
        order:true
      }
    });
    if (!detailsOrder) {
      throw new NotFoundException(`Order details with ID ${id} not found`);
    }
    return detailsOrder;
  }

  async create(createDetailsOrderDto: CreateDetailsOrderDto) {

    try {
      const orderDetail = await this.detailsOrderRepository.save({
        ...createDetailsOrderDto,
        order: { id: createDetailsOrderDto.orderId },
        product: { id: createDetailsOrderDto.productId },
      });
      return await this.findOne(orderDetail.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el detalle de la receta');
    }
  }

  async update(id: number, updateDetailsOrderDto: UpdateDetailsOrderDto) {
    const detailsOrder = await this.findOne(id);
    try {
      const updatedDetailsOrder = this.detailsOrderRepository.merge(detailsOrder, updateDetailsOrderDto);
      return await this.detailsOrderRepository.save(updatedDetailsOrder);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el detalle de la orden');
    }
  }

  async remove(id: number) {
    const detailsOrder = await this.findOne(id);
    try {
      await this.detailsOrderRepository.remove(detailsOrder);
      return {
        success: true,
        message: 'Detalle pedido eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el detalle de la orden');
    }
  }
}
