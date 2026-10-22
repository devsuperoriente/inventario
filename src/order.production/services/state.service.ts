import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStateDto } from '../dto/create-state.dto.js';
import { UpdateStateDto } from '../dto/update-state.dto.js';
import { State } from '../entities/state.entity.js';

@Injectable()
export class StateService {
  constructor(
    @InjectRepository(State)
    private readonly statesRepository: Repository<State>,
  ) {}

  findAll() {
    return this.statesRepository.find();
  }

  async findOne(id: number) {
    const state = await this.statesRepository.findOne({ where: { id } });
    if (!state) {
      throw new NotFoundException(`State with ID ${id} not found`);
    }
    return state;
  }

  async create(createStateDto: CreateStateDto) {
    try {
      return await this.statesRepository.save(createStateDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el estado');
    }
  }

  async update(id: number, updateStateDto: UpdateStateDto) {
    const state = await this.findOne(id);
    try {
      const updatedState = this.statesRepository.merge(state, updateStateDto);
      return await this.statesRepository.save(updatedState);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el estado');
    }
  }

  async remove(id: number) {
    const state = await this.findOne(id);

    try {
      await this.statesRepository.remove(state);

      return {
        success: true,
        message: 'Estado eliminado correctamente',
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }

      throw new UnprocessableEntityException('Error al eliminar el estado');
    }
  }
}
