import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { OrderProductionService } from '../services/order.production.service.js';
import { CreateOrderProductionDto } from '../dto/create-order.production.dto.js';
import { UpdateOrderProductionDto } from '../dto/update-order.production.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { Payload } from '../../auth/models/payload.js';
import { RequirePermissions } from '../../roles/decorators/require-permissions.decorator.js';
import { RolesGuard } from '../../roles/guards/roles.guard.js';

@Controller('ordenes-produccion')
export class OrderProductionController {
  constructor(private readonly orderProductionService: OrderProductionService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('production-orders:create')
  @Post()
  create(@Body() createOrderProductionDto: CreateOrderProductionDto, @Request() req: any) {
    const payload = req.user as Payload;
    const userId = payload.sub;
    return this.orderProductionService.create(createOrderProductionDto, userId);
  }

  @Get()
  findAll() {
    return this.orderProductionService.findAll();
  }

  @Get(':id/insumos-requeridos')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //  @RequirePermissions('production-orders:read')
  findRequiredMaterials(@Param('id', ParseIntPipe) id: number) {
    return this.orderProductionService.findRequiredMaterials(id);
  }

  @Post(':id/consumos-materia-prima')
  //@UseGuards(JwtAuthGuard, RolesGuard)
  //@RequirePermissions('production-orders:consume')
  consumeRequiredMaterials(@Param('id', ParseIntPipe) id: number) {
    return this.orderProductionService.consumeRequiredMaterials(id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @RequirePermissions('production-orders:read')
  findOne(@Param('id') id: string) {
    return this.orderProductionService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderProductionDto: UpdateOrderProductionDto) {
    return this.orderProductionService.update(+id, updateOrderProductionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderProductionService.remove(+id);
  }
}
