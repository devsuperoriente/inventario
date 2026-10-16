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
}
