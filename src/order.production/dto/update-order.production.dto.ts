import { PartialType } from '@nestjs/swagger';
import { CreateOrderProductionDto } from './create-order.production.dto.js';

export class UpdateOrderProductionDto extends PartialType(CreateOrderProductionDto) {}
