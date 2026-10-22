import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { DetailsOrderService } from '../services/details.order.service.js';
import { CreateDetailsOrderDto } from '../dto/create-details.order.dto.js';
import { UpdateDetailsOrderDto } from '../dto/update-details.order.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RequirePermissions } from '../../roles/decorators/require-permissions.decorator.js';
import { RolesGuard } from '../../roles/guards/roles.guard.js';

@Controller('detalle-pedidos')
export class DetailsOrderController {
  constructor(private readonly detailsOrderService: DetailsOrderService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('orders:create')
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

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDetailsOrderDto: UpdateDetailsOrderDto) {
    return this.detailsOrderService.update(+id, updateDetailsOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.detailsOrderService.remove(+id);
  }
}
