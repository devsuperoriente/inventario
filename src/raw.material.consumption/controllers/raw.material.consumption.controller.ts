import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RawMaterialConsumptionService } from '../services/raw.material.consumption.service.js';
import { CreateRawMaterialConsumptionDto } from '../dto/create-raw.material.consumption.dto.js';
import { UpdateRawMaterialConsumptionDto } from '../dto/update-raw.material.consumption.dto.js';

@Controller('raw.material.consumption')
export class RawMaterialConsumptionController {
  constructor(private readonly rawMaterialConsumptionService: RawMaterialConsumptionService) {}

  @Post()
  create(@Body() createRawMaterialConsumptionDto: CreateRawMaterialConsumptionDto) {
    return this.rawMaterialConsumptionService.create(createRawMaterialConsumptionDto);
  }

  @Get()
  findAll() {
    return this.rawMaterialConsumptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rawMaterialConsumptionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRawMaterialConsumptionDto: UpdateRawMaterialConsumptionDto) {
    return this.rawMaterialConsumptionService.update(+id, updateRawMaterialConsumptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rawMaterialConsumptionService.remove(+id);
  }
}
