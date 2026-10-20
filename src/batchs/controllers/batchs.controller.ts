import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BatchsService } from '../services/batchs.service.js';
import { CreateBatchDto } from '../dto/create-batch.dto.js';
import { UpdateBatchDto } from '../dto/update-batch.dto.js';

@Controller('batchs')
export class BatchsController {
  constructor(private readonly batchsService: BatchsService) {}

  @Post()
  create(@Body() createBatchDto: CreateBatchDto) {
    return this.batchsService.create(createBatchDto);
  }

  @Get()
  findAll() {
    return this.batchsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.batchsService.findOne(+id);
  }

  @Get('/code/:id')
  findBatchsByCode(@Param('id') id: string) {
    return this.batchsService.getBatchByCode(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBatchDto: UpdateBatchDto) {
    return this.batchsService.update(+id, updateBatchDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.batchsService.remove(+id);
  }
}
