import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitsMeasurementDto } from './create-units.measurement.dto.js';

export class UpdateUnitsMeasurementDto extends PartialType(CreateUnitsMeasurementDto) {}
