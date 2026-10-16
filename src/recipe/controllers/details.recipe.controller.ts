import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetailsRecipeService } from '../services/details.recipe.service.js';
import { CreateDetailsRecipeDto } from '../dto/create-details.recipe.dto.js';
import { UpdateDetailsRecipeDto } from '../dto/update-details.recipe.dto.js';

@Controller('details.recipe')
export class DetailsRecipeController {
  constructor(private readonly detailsRecipeService: DetailsRecipeService) {}

  @Post()
  create(@Body() createDetailsRecipeDto: CreateDetailsRecipeDto) {
    return this.detailsRecipeService.create(createDetailsRecipeDto);
  }

  @Get()
  findAll() {
    return this.detailsRecipeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detailsRecipeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetailsRecipeDto: UpdateDetailsRecipeDto) {
    return this.detailsRecipeService.update(+id, updateDetailsRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detailsRecipeService.remove(+id);
  }
}
