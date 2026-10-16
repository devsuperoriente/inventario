import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateTypeMovementDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
