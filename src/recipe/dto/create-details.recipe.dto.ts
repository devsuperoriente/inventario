import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDetailsRecipeDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsOptional()
  observation: string;

  @Type(() => Number)
  @IsNumber()
  recipeId: number;

  @Type(() => Number)
  @IsNumber()
  productId: number;
}
