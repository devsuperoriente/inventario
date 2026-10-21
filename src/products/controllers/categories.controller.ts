import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { CategorysService } from '../services/categories.service.js';
import { CreateCategoryDto } from '../dto/create-category.dto.js';
import { UpdateCategoryDto } from '../dto/update-category.dto.js';

@Controller('categorias')
export class CategorysController {
  constructor(private readonly categorysService: CategorysService) {}

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categorysService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categorysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categorysService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categorysService.update(+id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categorysService.remove(+id);
  }
}
