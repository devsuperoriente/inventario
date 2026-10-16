import { PartialType } from '@nestjs/swagger';
import { CreateStateDto } from './create-state.dto.js';

export class UpdateStateDto extends PartialType(CreateStateDto) {}
