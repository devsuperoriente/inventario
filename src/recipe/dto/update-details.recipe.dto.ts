import { PartialType } from '@nestjs/mapped-types';
import { CreateDetailsRecipeDto } from './create-details.recipe.dto.js';

export class UpdateDetailsRecipeDto extends PartialType(CreateDetailsRecipeDto) {}
