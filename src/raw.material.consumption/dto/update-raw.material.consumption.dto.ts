import { PartialType } from '@nestjs/mapped-types';
import { CreateRawMaterialConsumptionDto } from './create-raw.material.consumption.dto.js';

export class UpdateRawMaterialConsumptionDto extends PartialType(CreateRawMaterialConsumptionDto) {}
