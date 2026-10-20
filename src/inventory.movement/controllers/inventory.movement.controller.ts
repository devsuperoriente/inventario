import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { InventoryMovementService } from '../services/inventory.movement.service.js';
import { CreateInventoryMovementDto } from '../dto/create-inventory.movement.dto.js';
import { UpdateInventoryMovementDto } from '../dto/update-inventory.movement.dto.js';

@Controller('movimiento-inventario')
export class InventoryMovementController {
  constructor(private readonly inventoryMovementService: InventoryMovementService) {}

  @Post()
  create(@Body() createInventoryMovementDto: CreateInventoryMovementDto) {
    return this.inventoryMovementService.create(createInventoryMovementDto);
  }

  @Get()
  findAll() {
    return this.inventoryMovementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inventoryMovementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateInventoryMovementDto: UpdateInventoryMovementDto) {
    return this.inventoryMovementService.update(+id, updateInventoryMovementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inventoryMovementService.remove(+id);
  }
}
