import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { RawMaterialConsumptionService } from '../services/raw.material.consumption.service.js';

@Controller('raw.material.consumption')
export class RawMaterialConsumptionController {
  constructor(private readonly rawMaterialConsumptionService: RawMaterialConsumptionService) {}

  @Get()
  findAll() {
    return this.rawMaterialConsumptionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rawMaterialConsumptionService.findOne(id);
  }
}
