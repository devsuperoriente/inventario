import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipeService } from './services/recipe.service.js';
import { RecipeController } from './controllers/recipe.controller.js';
import { Recipe } from './entities/recipe.entity.js';
import { DetailsRecipe } from './entities/details.recipe.entity.js';
import { DetailsRecipeController } from './controllers/details.recipe.controller.js';
import { DetailsRecipeService } from './services/details.recipe.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, DetailsRecipe])],
  controllers: [RecipeController, DetailsRecipeController],
  providers: [RecipeService, DetailsRecipeService],
  exports: [RecipeService, DetailsRecipeService],
})
export class RecipeModule {}
