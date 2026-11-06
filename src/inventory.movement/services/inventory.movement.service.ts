import { BadRequestException, HttpException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateInventoryMovementDto } from '../dto/create-inventory.movement.dto.js';
import { UpdateInventoryMovementDto } from '../dto/update-inventory.movement.dto.js';
import { InventoryMovement } from '../entities/inventory.movement.entity.js';
import { Batch } from '../../batchs/entities/batch.entity.js';
import { TypeMovement } from '../entities/type.movement.entity.js';
import { decimalToScaledInteger, parsePositiveModelDecimal, scaledIntegerToDecimal } from '../../order.production/utils/decimal-quantity.js';

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
    const { batchId, orderProductionId, typeMovementId, quantity } = createInventoryMovementDto;
    try {
      const savedMovement = await this.inventoryMovementsRepository.manager.transaction(async (manager) => {
        const movementRepository = manager.getRepository(InventoryMovement);
        const batchRepository = manager.getRepository(Batch);
        const typeMovementRepository = manager.getRepository(TypeMovement);
        const batch = await batchRepository.findOne({
          where: { id: batchId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!batch) {
          throw new NotFoundException(`Batch with ID ${batchId} not found`);
        }

        const typeMovement = await typeMovementRepository.findOne({
          where: { id: typeMovementId, isActive: true },
        });
        if (!typeMovement) {
          throw new NotFoundException(`Active inventory movement type with ID ${typeMovementId} not found`);
        }

        let balancePrevius: number | string | null | undefined = createInventoryMovementDto.balancePrevius;
        let balanceCurrent: number | string | null | undefined = createInventoryMovementDto.balanceCurrent;
        const movementName = typeMovement.name.trim().toUpperCase();
        if (movementName === 'MERMA' || movementName === 'SALIDA') {
          const movementQuantity = decimalToScaledInteger(parsePositiveModelDecimal(quantity, 'La cantidad del movimiento'), 2);
          const balanceText = String(batch.quantityAvailable);
          const previousBalance = /^0(?:\.0{1,2})?$/.test(balanceText) ? 0n : decimalToScaledInteger(parsePositiveModelDecimal(batch.quantityAvailable, `El saldo del lote ${batch.code}`), 2);

          if (movementQuantity > previousBalance) {
            throw new UnprocessableEntityException(`Inventario insuficiente en el lote ${batch.code ?? batch.id}: se requieren ${scaledIntegerToDecimal(movementQuantity, 2)} y hay ${scaledIntegerToDecimal(previousBalance, 2)} disponibles`);
          }

          const currentBalance = previousBalance - movementQuantity;
          balancePrevius = scaledIntegerToDecimal(previousBalance, 2);
          balanceCurrent = scaledIntegerToDecimal(currentBalance, 2);
          batch.quantityAvailable = balanceCurrent;
          await batchRepository.save(batch);
        }

        const inventoryMovement = movementRepository.create({
          quantity,
          balancePrevius,
          balanceCurrent,
          date: createInventoryMovementDto.date,
          observation: createInventoryMovementDto.observation,
          batch: { id: batchId },
          ...(orderProductionId != null ? { ordersProduction: { id: orderProductionId } } : {}),
          typeMovement: { id: typeMovementId },
        });

        return movementRepository.save(inventoryMovement);
      });

      return await this.findOne(savedMovement.id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
        ...(orderProductionId !== undefined ? { ordersProduction: orderProductionId === null ? null : { id: orderProductionId } } : {}),
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
