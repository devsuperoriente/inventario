import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { UnitsMeasurementService } from '../services/units.measurement.service.js';
import { CreateUnitsMeasurementDto } from '../dto/create-units.measurement.dto.js';
import { UpdateUnitsMeasurementDto } from '../dto/update-units.measurement.dto.js';

@Controller('unidades-medida')
export class UnitsMeasurementController {
  constructor(private readonly unitsMeasurementService: UnitsMeasurementService) {}

  @Post()
  create(@Body() createUnitsMeasurementDto: CreateUnitsMeasurementDto) {
    return this.unitsMeasurementService.create(createUnitsMeasurementDto);
  }

  @Get()
  findAll() {
    return this.unitsMeasurementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.unitsMeasurementService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUnitsMeasurementDto: UpdateUnitsMeasurementDto) {
    return this.unitsMeasurementService.update(+id, updateUnitsMeasurementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.unitsMeasurementService.remove(+id);
  }
}
