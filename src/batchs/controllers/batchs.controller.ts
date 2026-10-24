import { Controller, Get, Post, Body, Param, Delete, Put, ParseIntPipe } from '@nestjs/common';
import { BatchsService } from '../services/batchs.service.js';
import { CreateBatchDto } from '../dto/create-batch.dto.js';
import { UpdateBatchDto } from '../dto/update-batch.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RequirePermissions } from '../../roles/decorators/require-permissions.decorator.js';
import { RolesGuard } from '../../roles/guards/roles.guard.js';

@Controller('lotes')
//@UseGuards(JwtAuthGuard, RolesGuard)
//@RequirePermissions('batches:manage')
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

  @Get('existencias')
  getStockSummary() {
    return this.batchsService.getStockSummary();
  }

  @Get('producto/:productId/existencias')
  getStockByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.batchsService.getStockByProduct(productId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.batchsService.findOne(id);
  }

  @Get('/code/:id')
  findBatchsByCode(@Param('id') code: string) {
    return this.batchsService.getBatchByCode(code);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateBatchDto: UpdateBatchDto) {
    return this.batchsService.update(id, updateBatchDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.batchsService.remove(id);
  }
}
