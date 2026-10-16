import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderProductionDto } from './create-order.production.dto.js';

export class UpdateOrderProductionDto extends PartialType(CreateOrderProductionDto) {}
