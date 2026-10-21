import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  numberOrder: string;

  @IsDateString()
  dateOrder: string;

  @Type(() => Number)
  @IsNumber()
  clientId: number;
}
