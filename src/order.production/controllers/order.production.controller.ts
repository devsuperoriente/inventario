import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrderProductionService } from '../services/order.production.service.js';
import { CreateOrderProductionDto } from '../dto/create-order.production.dto.js';
import { UpdateOrderProductionDto } from '../dto/update-order.production.dto.js';

@Controller('order.production')
export class OrderProductionController {
  constructor(private readonly orderProductionService: OrderProductionService) {}

  @Post()
  create(@Body() createOrderProductionDto: CreateOrderProductionDto) {
    return this.orderProductionService.create(createOrderProductionDto);
  }

  @Get()
  findAll() {
    return this.orderProductionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderProductionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderProductionDto: UpdateOrderProductionDto) {
    return this.orderProductionService.update(+id, updateOrderProductionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderProductionService.remove(+id);
  }
}
