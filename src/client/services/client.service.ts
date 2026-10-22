import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClientDto } from '../dto/create-client.dto.js';
import { UpdateClientDto } from '../dto/update-client.dto.js';
import { Client } from '../entities/client.entity.js';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  findAll() {
    return this.clientsRepository.find();
  }

  async findOne(id: number) {
    const client = await this.clientsRepository.findOne({ where: { id } });
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async create(createClientDto: CreateClientDto) {
    try {
      return await this.clientsRepository.save(createClientDto);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
      throw new BadRequestException('Error al crear el cliente');
    }
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.findOne(id);
    try {
      const updatedClient = this.clientsRepository.merge(client, updateClientDto);
      return await this.clientsRepository.save(updatedClient);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }
      throw new UnprocessableEntityException('Error al actualizar el cliente');
    }
  }

  async remove(id: number) {
    const client = await this.findOne(id);

    try {
      await this.clientsRepository.remove(client);

      return {
        message: 'Cliente eliminado correctamente',
        id: client.id,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }

      throw new UnprocessableEntityException('Error al eliminar el cliente');
    }
  }
}
