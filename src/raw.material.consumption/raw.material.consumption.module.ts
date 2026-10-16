import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RawMaterialConsumptionService } from './raw.material.consumption.service.js';
import { RawMaterialConsumptionController } from './raw.material.consumption.controller.js';
import { RawMaterialConsumption } from './entities/raw.material.consumption.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([RawMaterialConsumption])],
  controllers: [RawMaterialConsumptionController],
  providers: [RawMaterialConsumptionService],
})
export class RawMaterialConsumptionModule {}
