import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  numberOrder: string;

  @IsDateString()
  dateOrder: string;
}
