import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
