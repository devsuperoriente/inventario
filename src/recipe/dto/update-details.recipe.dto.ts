import { PartialType } from '@nestjs/swagger';
import { CreateDetailsRecipeDto } from './create-details.recipe.dto.js';

export class UpdateDetailsRecipeDto extends PartialType(CreateDetailsRecipeDto) {}
