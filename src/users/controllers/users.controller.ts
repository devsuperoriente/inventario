import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service.js';
import { CreateUserDto, UpdateUserDto } from '../dtos/user.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../entities/user.entity.js';
import { RolesGuard } from '../../roles/guards/roles.guard.js';
import { RequirePermissions } from '../../roles/decorators/require-permissions.decorator.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Ths list of users', type: User })
  @Get()
  getUsers() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: 'Get by ID to user' })
  @Get(':id')
  findUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getUserById(id);
  }

  @ApiOperation({ summary: 'Get by ID the profile' })
  @Get(':id/profile')
  findProfile(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.getProfileByUserId(id);
  }

  @ApiOperation({ summary: 'Create a new user' })
  //@UseGuards(JwtAuthGuard)
  @Post()
  createUser(@Body() user: CreateUserDto) {
    return this.usersService.create(user);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @Delete(':id')
  deleteUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.delete(id);
  }

  @ApiOperation({ summary: 'Update a user' })
  @Put(':id')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() updatedUser: UpdateUserDto) {
    return this.usersService.update(id, updatedUser);
  }

  @ApiOperation({ summary: 'Assign a role to a user' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('users:assign-role')
  @Patch(':id/role/:roleId')
  assignRole(@Param('id', ParseIntPipe) id: number, @Param('roleId', ParseIntPipe) roleId: number) {
    return this.usersService.updateRole(id, roleId);
  }
}
