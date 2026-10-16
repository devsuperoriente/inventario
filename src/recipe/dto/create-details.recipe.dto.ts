import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDetailsRecipeDto {
  @IsNumber()
  @IsOptional()
  amount?: number;

  @IsString()
  @IsNotEmpty()
  observation: string;
}
