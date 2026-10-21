import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { UpdateOrderDto } from '../dto/update-order.dto.js';
import { Order } from '../entities/order.entity.js';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
  ) {}

  findAll() {
    return this.ordersRepository.find({
      relations: {
        client:true
      }
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        client:true
      }
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      // Crear la orden
      const order = await this.ordersRepository.save({
        ...createOrderDto,
        client: { id: createOrderDto.clientId },
      });

      // Generar consecutivo
      order.numberOrder = `OP-${order.id.toString().padStart(6, '0')}`;

      // Guardar nuevamente
      await this.ordersRepository.save(order);

      return await this.findOne(order.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException(
        'Error al crear la orden de producción',
      );
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    const order = await this.findOne(id);
    try {
      const updatedOrder = this.ordersRepository.merge(order, updateOrderDto);
      return await this.ordersRepository.save(updatedOrder);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar la orden');
    }
  }

  async remove(id: number) {
    const order = await this.findOne(id);
    try {
      await this.ordersRepository.remove(order);
      return {
        success: true,
        message: 'Pedido eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar la orden');
    }
  }
}
