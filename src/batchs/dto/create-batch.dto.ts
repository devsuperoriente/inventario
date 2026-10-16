import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  @IsOptional()
  code?: string;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  quantityInitial?: number | null;

  @Type(() => Date)
  @IsDate()
  date: Date;

  @Type(() => Date)
  @IsDate()
  dateMatury: Date;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  temperature?: number | null;

  @IsString()
  @IsNotEmpty()
  observation: string;

  @IsString()
  @IsNotEmpty()
  image: string;
}
