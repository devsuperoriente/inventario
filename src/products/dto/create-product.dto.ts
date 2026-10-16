import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsOptional()
  priceBeforeTax: number;

  @IsNumber()
  @IsOptional()
  priceAfterTax: number;

  @IsNumber()
  @IsOptional()
  tax: number;

  @IsNumber()
  @IsOptional()
  stockMin: number;

  @IsNumber()
  @IsOptional()
  categoryId: number;

  @IsNumber()
  @IsOptional()
  unitsMeasurementId: number;

  @IsNumber()
  @IsOptional()
  providerId?: number;
}
