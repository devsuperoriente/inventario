import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Profile } from './entities/profile.entity.js';
import { UsersController } from './controllers/users.controller.js';
import { PasswordHasher } from '@nestjs/authentication';
import { Role } from '../roles/entities/role.entity.js';
import { RolesModule } from '../roles/roles.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, Role]), RolesModule],
  controllers: [UsersController],
  providers: [UsersService, PasswordHasher],
  exports: [UsersService, PasswordHasher],
})
export class UsersModule {}
