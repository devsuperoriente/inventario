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
  @IsOptional()
  date?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dateMatury: Date;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  temperature?: number | null;

  @IsString()
  @IsOptional()
  observation: string;

  @IsString()
  @IsOptional()
  image: string;

  @Type(() => Number)
  @IsNumber()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  providerId: number;
}
