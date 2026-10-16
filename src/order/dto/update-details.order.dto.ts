import { PartialType } from '@nestjs/mapped-types';
import { CreateDetailsOrderDto } from './create-details.order.dto.js';

export class UpdateDetailsOrderDto extends PartialType(CreateDetailsOrderDto) {}
