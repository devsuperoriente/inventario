import { PartialType } from '@nestjs/mapped-types';
import { CreateTypeMovementDto } from './create-type.movement.dto.js';

export class UpdateTypeMovementDto extends PartialType(CreateTypeMovementDto) {}
