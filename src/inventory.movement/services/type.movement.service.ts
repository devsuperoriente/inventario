import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeMovement } from '../entities/type.movement.entity.js';
import { CreateTypeMovementDto } from '../dto/create-type.movement.dto.js';
import { UpdateTypeMovementDto } from '../dto/update-type.movement.dto.js';

@Injectable()
export class TypeMovementService {
  constructor(
    @InjectRepository(TypeMovement)
    private readonly typeMovementsRepository: Repository<TypeMovement>,
  ) {}

  findAll() {
    return this.typeMovementsRepository.find();
  }

  async findOne(id: number) {
    const typeMovement = await this.typeMovementsRepository.findOne({ where: { id } });
    if (!typeMovement) {
      throw new NotFoundException(`Type movement with ID ${id} not found`);
    }
    return typeMovement;
  }

  async create(createTypeMovementDto: CreateTypeMovementDto) {
    try {
      return await this.typeMovementsRepository.save(createTypeMovementDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el tipo de movimiento');
    }
  }

  async update(id: number, updateTypeMovementDto: UpdateTypeMovementDto) {
    const typeMovement = await this.findOne(id);
    try {
      const updatedTypeMovement = this.typeMovementsRepository.merge(typeMovement, updateTypeMovementDto);
      return await this.typeMovementsRepository.save(updatedTypeMovement);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el tipo de movimiento');
    }
  }

  async remove(id: number) {
    const typeMovement = await this.findOne(id);
    try {
      await this.typeMovementsRepository.remove(typeMovement);
      return {
        success: true,
        message: 'Tipo de movimiento eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el tipo de movimiento');
    }
  }
}
