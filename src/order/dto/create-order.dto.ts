import { Type } from 'class-transformer';
import { IsDateString, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  numberOrder: string;

  @IsDateString()
  dateOrder: string;

  @Type(() => Number)
  @IsNumber()
  clientId: number;
}
