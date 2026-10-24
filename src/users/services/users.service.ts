import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto.js';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity.js';
import { Repository } from 'typeorm';
import { PasswordHasher } from '@nestjs/authentication';
import { Role } from '../../roles/entities/role.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
    private readonly passwordHasher: PasswordHasher, // <-- Inyectas el hasher aquí
  ) {}

  async findAll() {
    const users = await this.usersRepository.find({ relations: { profile: true, role: true } });
    return users;
  }

  async getUserById(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id }, // <--- ¡Esto es lo que faltaba!
      relations: { profile: true, role: true },
    });

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
      const hashedPassword = await this.passwordHasher.hash(user.password);

      // 1. Creamos la instancia con create() de forma limpia
      const newUser = this.usersRepository.create({
        username: user.username,
        email: user.email,
        profile: user.profile,
        password: hashedPassword,
        // Pasamos un objeto con el id para relacionarlo directamente
        role: { id: user.roleId },
      });

      // 2. Guardamos la instancia creada
      const savedUser = await this.usersRepository.save(newUser);
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

      const { roleId, ...restDto } = updatedUser;
      const roleData = roleId ? { role: { id: roleId } } : {};

      const updatedUserEntity = this.usersRepository.merge(user, {
        ...restDto,
        ...roleData,
      });

      // 1. Guardamos los cambios
      await this.usersRepository.save(updatedUserEntity);

      // 2. Retornamos el usuario buscándolo de nuevo con sus relaciones cargadas
      return await this.usersRepository.findOne({
        where: { id },
        relations: {
          role: true,
          profile: true,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new UnprocessableEntityException(error.message);
      }

      throw new UnprocessableEntityException('Error al actualizar el usuario');
    }
  }

  async updateRole(id: number, roleId: number) {
    const user = await this.findOne(id);
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException(`Role with ID ${roleId} not found`);
    }

    user.role = role;
    return this.usersRepository.save(user);
  }

  async getPermissionsForUser(id: number): Promise<string[]> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: { role: true } });
    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }
    return user.role?.permissions ?? [];
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
        role: true,
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
