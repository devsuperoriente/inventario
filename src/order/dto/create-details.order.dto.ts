import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class CreateDetailsOrderDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  subtotal?: number;

  @Type(() => Number)
  @IsNumber()
  orderId?: number;

  @Type(() => Number)
  @IsNumber()
  productId?: number;
}
