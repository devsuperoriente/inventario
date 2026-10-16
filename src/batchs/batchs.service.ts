import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBatchDto } from './dto/create-batch.dto.js';
import { UpdateBatchDto } from './dto/update-batch.dto.js';
import { Batch } from './entities/batch.entity.js';

@Injectable()
export class BatchsService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchsRepository: Repository<Batch>,
  ) {}

  findAll() {
    return this.batchsRepository.find();
  }

  async findOne(id: number) {
    const batch = await this.batchsRepository.findOne({ where: { id } });
    if (!batch) {
      throw new NotFoundException(`Batch with ID ${id} not found`);
    }
    return batch;
  }

  async create(createBatchDto: CreateBatchDto) {
    try {
      return await this.batchsRepository.save(createBatchDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el lote');
    }
  }

  async update(id: number, updateBatchDto: UpdateBatchDto) {
    const batch = await this.findOne(id);
    try {
      const updatedBatch = this.batchsRepository.merge(batch, updateBatchDto);
      return await this.batchsRepository.save(updatedBatch);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el lote');
    }
  }

  async remove(id: number) {
    const batch = await this.findOne(id);
    try {
      await this.batchsRepository.remove(batch);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el lote');
    }
  }
}
