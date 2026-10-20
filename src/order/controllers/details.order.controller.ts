import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DetailsOrderService } from '../services/details.order.service.js';
import { CreateDetailsOrderDto } from '../dto/create-details.order.dto.js';
import { UpdateDetailsOrderDto } from '../dto/update-details.order.dto.js';

@Controller('detalle-pedido')
export class DetailsOrderController {
  constructor(private readonly detailsOrderService: DetailsOrderService) {}

  @Post()
  create(@Body() createDetailsOrderDto: CreateDetailsOrderDto) {
    return this.detailsOrderService.create(createDetailsOrderDto);
  }

  @Get()
  findAll() {
    return this.detailsOrderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.detailsOrderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDetailsOrderDto: UpdateDetailsOrderDto) {
    return this.detailsOrderService.update(+id, updateDetailsOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detailsOrderService.remove(+id);
  }
}
