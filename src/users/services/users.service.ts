import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity.js';
import { Repository } from 'typeorm';
import { PasswordHasher } from '@nestjs/authentication';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly passwordHasher: PasswordHasher, // <-- Inyectas el hasher aquí
  ) {}

  async findAll() {
    const users = await this.usersRepository.find({ relations: { profile: true } });
    return users;
  }

  async getUserById(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getProfileByUserId(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user.profile;
  }

  async create(user: CreateUserDto) {
    try {
      // 1. Hasheas la contraseña usando el método de la nueva documentación
      const hashedPassword = await this.passwordHasher.hash(user.password);

      const savedUser = await this.usersRepository.save({
        ...user,
        password: hashedPassword,
      });
      return savedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException('Error al crear el usuario');
    }
  }

  async checkPassword(password: string, storedHash: string | undefined) {
    if (!storedHash) return false;
    return this.passwordHasher.verify(password, storedHash); //[cite: 1]
  }

  async update(id: number, updatedUser: UpdateUserDto) {
    try {
      const user = await this.findOne(id);
      const updatedUserEntity = await this.usersRepository.merge(user, updatedUser);
      const savedUser = await this.usersRepository.save(updatedUserEntity);
      return savedUser;
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }

      throw new UnprocessableEntityException('Error al actualizar el usuario');
    }
  }

  async delete(id: number) {
    try {
      await this.usersRepository.delete(id);
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }

      throw new UnprocessableEntityException('Error al eliminar el usuario');
    }
  }

  private async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        profile: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findUserByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({
      where: { username },
    });

    return user;
  }
}
