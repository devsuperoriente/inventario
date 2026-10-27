import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
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
        client: true,
      },
    });
  }

  async findAllByToday(): Promise<Order[]> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    return this.ordersRepository.find({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
      relations: {
        client: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: {
        client: true,
      },
    });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async getOrdersByDate(date: string) {
    const startDate = new Date(`${date}T00:00:00.000`);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    return this.ordersRepository.createQueryBuilder('order').leftJoinAndSelect('order.client', 'client').where('order.createdAt >= :startDate', { startDate }).andWhere('order.createdAt < :endDate', { endDate }).orderBy('order.createdAt', 'DESC').getMany();
  }

  async create(createOrderDto: CreateOrderDto) {
    try {
      // Crear la orden
      const order = await this.ordersRepository.save({
        ...createOrderDto,
        client: { id: createOrderDto.clientId },
      });

      // Generar consecutivo
      order.numberOrder = `P-${order.id.toString().padStart(6, '0')}`;

      // Guardar nuevamente
      await this.ordersRepository.save(order);

      return await this.findOne(order.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Error al crear la orden de producción');
    }
  }

  async update(id: number, updateOrderDto: UpdateOrderDto) {
    try {
      const order = await this.findOne(id);

      const { clientId, ...orderData } = updateOrderDto;

      const updatedOrder = this.ordersRepository.merge(order, orderData);

      if (clientId !== undefined) {
        updatedOrder.client = { id: clientId } as any;
      }

      await this.ordersRepository.save(updatedOrder);

      // Retornar el producto actualizado con sus relaciones
      return await this.ordersRepository.findOne({
        where: { id },
        relations: {
          client: true,
        },
      });
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
