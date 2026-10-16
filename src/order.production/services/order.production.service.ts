import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderProductionDto } from '../dto/create-order.production.dto.js';
import { UpdateOrderProductionDto } from '../dto/update-order.production.dto.js';
import { OrderProduction } from '../entities/order.production.entity.js';

@Injectable()
export class OrderProductionService {
  constructor(
    @InjectRepository(OrderProduction)
    private readonly orderProductionsRepository: Repository<OrderProduction>,
  ) {}

  findAll() {
    return this.orderProductionsRepository.find({
      relations: { state: true, product: true },
    });
  }

  async findOne(id: number) {
    const orderProduction = await this.orderProductionsRepository.findOne({
      where: { id },
      relations: { state: true, product: true },
    });
    if (!orderProduction) {
      throw new NotFoundException(`Production order with ID ${id} not found`);
    }
    return orderProduction;
  }

  async create(createOrderProductionDto: CreateOrderProductionDto) {
    const { stateId, productId, ...orderProductionFields } = createOrderProductionDto;
    try {
      const orderProduction = await this.orderProductionsRepository.save({
        ...orderProductionFields,
        state: { id: stateId },
        product: { id: productId },
      });
      return await this.findOne(orderProduction.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear la orden de producción');
    }
  }

  async update(id: number, updateOrderProductionDto: UpdateOrderProductionDto) {
    const orderProduction = await this.findOne(id);
    const { stateId, productId, ...orderProductionFields } = updateOrderProductionDto;
    try {
      const updatedOrderProduction = this.orderProductionsRepository.merge(orderProduction, {
        ...orderProductionFields,
        ...(stateId !== undefined ? { state: { id: stateId } } : {}),
        ...(productId !== undefined ? { product: { id: productId } } : {}),
      });
      await this.orderProductionsRepository.save(updatedOrderProduction);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar la orden de producción');
    }
  }

  async remove(id: number) {
    const orderProduction = await this.findOne(id);
    try {
      await this.orderProductionsRepository.remove(orderProduction);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar la orden de producción');
    }
  }
}
