import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { TypeMovementService } from '../services/type.movement.service.js';
import { CreateTypeMovementDto } from '../dto/create-type.movement.dto.js';
import { UpdateTypeMovementDto } from '../dto/update-type.movement.dto.js';

@Controller('tipos-movimiento')
export class TypeMovementController {
  constructor(private readonly typeMovementService: TypeMovementService) {}

  @Post()
  create(@Body() createTypeMovementDto: CreateTypeMovementDto) {
    return this.typeMovementService.create(createTypeMovementDto);
  }

  @Get()
  findAll() {
    return this.typeMovementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.typeMovementService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateTypeMovementDto: UpdateTypeMovementDto) {
    return this.typeMovementService.update(+id, updateTypeMovementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.typeMovementService.remove(+id);
  }
}
