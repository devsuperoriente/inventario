import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Query } from '@nestjs/common';
import { OrderService } from '../services/order.service.js';
import { CreateOrderDto } from '../dto/create-order.dto.js';
import { UpdateOrderDto } from '../dto/update-order.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { RequirePermissions } from '../../roles/decorators/require-permissions.decorator.js';
import { RolesGuard } from '../../roles/guards/roles.guard.js';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pedidos')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @RequirePermissions('orders:create')
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  @RequirePermissions('orders:read')
  findAll() {
    return this.orderService.findAll();
  }

  @Get('/today')
  @RequirePermissions('orders:read')
  findAllByToday() {
    return this.orderService.findAllByToday();
  }

  @Get('by-date')
  @RequirePermissions('orders:read')
  getOrdersByDate(@Query('date') date: string) {
    return this.orderService.getOrdersByDate(date);
  }

  @Get(':id')
  @RequirePermissions('orders:read')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions('orders:update')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  @RequirePermissions('orders:delete')
  remove(@Param('id') id: string) {
    return this.orderService.remove(+id);
  }
}
