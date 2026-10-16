import { PartialType } from '@nestjs/swagger';
import { CreateTypeMovementDto } from './create-type.movement.dto.js';

export class UpdateTypeMovementDto extends PartialType(CreateTypeMovementDto) {}
