import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRawMaterialConsumptionDto } from '../dto/create-raw.material.consumption.dto.js';
import { UpdateRawMaterialConsumptionDto } from '../dto/update-raw.material.consumption.dto.js';
import { RawMaterialConsumption } from '../entities/raw.material.consumption.entity.js';

@Injectable()
export class RawMaterialConsumptionService {
  constructor(
    @InjectRepository(RawMaterialConsumption)
    private readonly rawMaterialConsumptionsRepository: Repository<RawMaterialConsumption>,
  ) {}

  findAll() {
    return this.rawMaterialConsumptionsRepository.find({
      relations: { batch: true, ordersProduction: true },
    });
  }

  async findOne(id: number) {
    const consumption = await this.rawMaterialConsumptionsRepository.findOne({
      where: { id },
      relations: { batch: true, ordersProduction: true },
    });
    if (!consumption) {
      throw new NotFoundException(`Raw material consumption with ID ${id} not found`);
    }
    return consumption;
  }

  async create(createRawMaterialConsumptionDto: CreateRawMaterialConsumptionDto) {
    const { batchId, orderProductionId, ...consumptionFields } = createRawMaterialConsumptionDto;
    try {
      const consumption = await this.rawMaterialConsumptionsRepository.save({
        ...consumptionFields,
        batch: { id: batchId },
        ordersProduction: { id: orderProductionId },
      });
      return await this.findOne(consumption.id);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el consumo de materia prima');
    }
  }

  async update(id: number, updateRawMaterialConsumptionDto: UpdateRawMaterialConsumptionDto) {
    const consumption = await this.findOne(id);
    const { batchId, orderProductionId, ...consumptionFields } = updateRawMaterialConsumptionDto;
    try {
      const updatedConsumption = this.rawMaterialConsumptionsRepository.merge(consumption, {
        ...consumptionFields,
        ...(batchId !== undefined ? { batch: { id: batchId } } : {}),
        ...(orderProductionId !== undefined ? { ordersProduction: { id: orderProductionId } } : {}),
      });
      await this.rawMaterialConsumptionsRepository.save(updatedConsumption);
      return await this.findOne(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el consumo de materia prima');
    }
  }

  async remove(id: number) {
    const consumption = await this.findOne(id);
    try {
      await this.rawMaterialConsumptionsRepository.remove(consumption);
      return {
        success: true,
        message: 'Consumo de material eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el consumo de materia prima');
    }
  }
}
