import { PartialType } from '@nestjs/swagger';
import { CreateRawMaterialConsumptionDto } from './create-raw.material.consumption.dto.js';

export class UpdateRawMaterialConsumptionDto extends PartialType(CreateRawMaterialConsumptionDto) {}
