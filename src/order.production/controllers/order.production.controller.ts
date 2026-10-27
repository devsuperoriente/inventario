import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { OrderProductionService } from '../services/order.production.service.js';
import { CreateOrderProductionDto } from '../dto/create-order.production.dto.js';
import { UpdateOrderProductionDto } from '../dto/update-order.production.dto.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { Payload } from '../../auth/models/payload.js';
import { RequirePermissions } from '../../roles/decorators/require-permissions.decorator.js';
import { RolesGuard } from '../../roles/guards/roles.guard.js';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ordenes-produccion')
export class OrderProductionController {
  constructor(private readonly orderProductionService: OrderProductionService) {}

  @Post()
  @RequirePermissions('production-orders:create')
  create(@Body() createOrderProductionDto: CreateOrderProductionDto, @Request() req: any) {
    const payload = req.user as Payload;
    const userId = payload.sub;
    return this.orderProductionService.create(createOrderProductionDto, userId);
  }

  @Get()
  @RequirePermissions('production-orders:read')
  findAll() {
    return this.orderProductionService.findAll();
  }

  @Get(':id/insumos-requeridos')
  @RequirePermissions('production-orders:read')
  findRequiredMaterials(@Param('id', ParseIntPipe) id: number) {
    return this.orderProductionService.findRequiredMaterials(id);
  }

  @Post(':id/consumos-materia-prima')
  @RequirePermissions('production-orders:consume')
  consumeRequiredMaterials(@Param('id', ParseIntPipe) id: number) {
    return this.orderProductionService.consumeRequiredMaterials(id);
  }

  @Get(':id')
  @RequirePermissions('production-orders:read')
  findOne(@Param('id') id: string) {
    return this.orderProductionService.findOne(+id);
  }

  @Put(':id')
  @RequirePermissions('production-orders:update')
  update(@Param('id') id: string, @Body() updateOrderProductionDto: UpdateOrderProductionDto) {
    return this.orderProductionService.update(+id, updateOrderProductionDto);
  }

  @Delete(':id')
  @RequirePermissions('production-orders:delete')
  remove(@Param('id') id: string) {
    return this.orderProductionService.remove(+id);
  }
}
