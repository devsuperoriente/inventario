import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnitsMeasurementDto } from '../dto/create-units.measurement.dto.js';
import { UpdateUnitsMeasurementDto } from '../dto/update-units.measurement.dto.js';
import { UnitsMeasurement } from '../entities/units.measurement.entity.js';

@Injectable()
export class UnitsMeasurementService {
  constructor(
    @InjectRepository(UnitsMeasurement)
    private readonly unitsMeasurementRepository: Repository<UnitsMeasurement>,
  ) {}

  findAll() {
    return this.unitsMeasurementRepository.find();
  }

  async findOne(id: number) {
    const unitsMeasurement = await this.unitsMeasurementRepository.findOne({ where: { id } });
    if (!unitsMeasurement) {
      throw new NotFoundException(`Units measurement with ID ${id} not found`);
    }
    return unitsMeasurement;
  }

  async create(createUnitsMeasurementDto: CreateUnitsMeasurementDto) {
    try {
      return await this.unitsMeasurementRepository.save(createUnitsMeasurementDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear la unidad de medida');
    }
  }

  async update(id: number, updateUnitsMeasurementDto: UpdateUnitsMeasurementDto) {
    try {
      const unitsMeasurement = await this.findOne(id);
      const updatedUnitsMeasurement = this.unitsMeasurementRepository.merge(unitsMeasurement, updateUnitsMeasurementDto);
      return await this.unitsMeasurementRepository.save(updatedUnitsMeasurement);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar la unidad de medida');
    }
  }

  async remove(id: number) {
    const unitsMeasurement = await this.findOne(id);
    try {
      await this.unitsMeasurementRepository.remove(unitsMeasurement);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar la unidad de medida');
    }
  }
}
