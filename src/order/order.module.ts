import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './services/order.service.js';
import { OrderController } from './controllers/order.controller.js';
import { Order } from './entities/order.entity.js';
import { DetailsOrder } from './entities/details.order.entity.js';
import { DetailsOrderController } from './controllers/details.order.controller.js';
import { DetailsOrderService } from './services/details.order.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Order, DetailsOrder])],
  controllers: [OrderController, DetailsOrderController],
  providers: [OrderService, DetailsOrderService],
  exports: [OrderService, DetailsOrderService],
})
export class OrderModule {}
