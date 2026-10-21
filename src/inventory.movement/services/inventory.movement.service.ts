import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryMovementDto } from '../dto/create-inventory.movement.dto.js';
import { UpdateInventoryMovementDto } from '../dto/update-inventory.movement.dto.js';
import { InventoryMovement } from '../entities/inventory.movement.entity.js';

@Injectable()
export class InventoryMovementService {
  constructor(
    @InjectRepository(InventoryMovement)
    private readonly inventoryMovementsRepository: Repository<InventoryMovement>,
  ) {}

  findAll() {
    return this.inventoryMovementsRepository.find({
      relations: { batch: true, ordersProduction: true, typeMovement: true },
    });
  }

  async findOne(id: number) {
    const inventoryMovement = await this.inventoryMovementsRepository.findOne({
      where: { id },
      relations: { batch: true, ordersProduction: true, typeMovement: true },
    });
    if (!inventoryMovement) {
      throw new NotFoundException(`Inventory movement with ID ${id} not found`);
    }
    return inventoryMovement;
  }

  async create(createInventoryMovementDto: CreateInventoryMovementDto) {
    const { batchId, orderProductionId, typeMovementId, ...movementFields } = createInventoryMovementDto;
    try {
      const inventoryMovement = await this.inventoryMovementsRepository.save({
        ...movementFields,
        batch: { id: batchId },
        ordersProduction: { id: orderProductionId },
        typeMovement: { id: typeMovementId },
      });
      return await this.findOne(inventoryMovement.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el movimiento de inventario');
    }
  }

  async update(id: number, updateInventoryMovementDto: UpdateInventoryMovementDto) {
    const inventoryMovement = await this.findOne(id);
    const { batchId, orderProductionId, typeMovementId, ...movementFields } = updateInventoryMovementDto;
    try {
      const updatedInventoryMovement = this.inventoryMovementsRepository.merge(inventoryMovement, {
        ...movementFields,
        ...(batchId !== undefined ? { batch: { id: batchId } } : {}),
        ...(orderProductionId !== undefined ? { ordersProduction: { id: orderProductionId } } : {}),
        ...(typeMovementId !== undefined ? { typeMovement: { id: typeMovementId } } : {}),
      });
      await this.inventoryMovementsRepository.save(updatedInventoryMovement);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el movimiento de inventario');
    }
  }

  async remove(id: number) {
    const inventoryMovement = await this.findOne(id);
    try {
      await this.inventoryMovementsRepository.remove(inventoryMovement);
      return {
        success: true,
        message: 'Movimiento de inventario eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el movimiento de inventario');
    }
  }
}
