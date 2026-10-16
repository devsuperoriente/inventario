import { Type } from 'class-transformer';
import { IsDate, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateOrderProductionDto {
  @IsString()
  @IsNotEmpty()
  numberOrder: string;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @IsNumber()
  stateId: number;

  @IsNumber()
  productId: number;
}
