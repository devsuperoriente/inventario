import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Provider } from '../entities/provider.entity.js';
import { CreateProviderDto } from '../dto/create-provider.dto.js';
import { UpdateProviderDto } from '../dto/update-provider.dto.js';

@Injectable()
export class ProvidersService {
  constructor(
    @InjectRepository(Provider)
    private readonly providersRepository: Repository<Provider>,
  ) {}

  findAll() {
    return this.providersRepository.find();
  }

  async findOne(id: number) {
    const provider = await this.providersRepository.findOne({ where: { id } });
    if (!provider) {
      throw new NotFoundException(`Provider with ID ${id} not found`);
    }
    return provider;
  }

  async create(createProviderDto: CreateProviderDto) {
    try {
      return await this.providersRepository.save(createProviderDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el proveedor');
    }
  }

  async update(id: number, updateProviderDto: UpdateProviderDto) {
    try {
      const provider = await this.findOne(id);
      const updatedProvider = this.providersRepository.merge(provider, updateProviderDto);
      return await this.providersRepository.save(updatedProvider);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el proveedor');
    }
  }

  async remove(id: number) {
    const provider = await this.findOne(id);
    try {
      await this.providersRepository.remove(provider);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al eliminar el proveedor');
    }
  }
}
