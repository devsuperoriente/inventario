import { PartialType } from '@nestjs/swagger';
import { CreateUnitsMeasurementDto } from './create-units.measurement.dto.js';

export class UpdateUnitsMeasurementDto extends PartialType(CreateUnitsMeasurementDto) {}
