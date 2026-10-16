import { Module } from '@nestjs/common';
import { OrderProductionService } from './services/order.production.service.js';
import { OrderProductionController } from './controllers/order.production.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProduction } from './entities/order.production.entity.js';
import { State } from './entities/state.entity.js';
import { StateController } from './controllers/state.controller.js';
import { StateService } from './services/state.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([OrderProduction, State])],
  controllers: [OrderProductionController, StateController],
  providers: [OrderProductionService, StateService],
  exports: [OrderProductionService, StateService],
})
export class OrderProductionModule {}
