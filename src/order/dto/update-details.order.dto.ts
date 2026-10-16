import { PartialType } from '@nestjs/swagger';
import { CreateDetailsOrderDto } from './create-details.order.dto.js';

export class UpdateDetailsOrderDto extends PartialType(CreateDetailsOrderDto) {}
