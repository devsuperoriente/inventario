import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class CreateBatchDto {
  @IsString()
  @IsOptional()
  code?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  quantityInitial: number;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  quantityAvailable?: number | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  entryDate?: Date;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  expirationDate: Date;

  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  temperature?: number | null;

  @IsString()
  @IsOptional()
  observation: string;

  @IsString()
  @IsOptional()
  imageUrl: string;

  @Type(() => Number)
  @IsNumber()
  productId: number;

  @Type(() => Number)
  @IsNumber()
  providerId: number;
}
