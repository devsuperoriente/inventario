import { Module } from '@nestjs/common';
import { OrderProductionService } from './services/order.production.service.js';
import { OrderProductionController } from './controllers/order.production.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderProduction } from './entities/order.production.entity.js';
import { Recipe } from '../recipe/entities/recipe.entity.js';
import { State } from './entities/state.entity.js';
import { StateController } from './controllers/state.controller.js';
import { StateService } from './services/state.service.js';
import { RolesModule } from '../roles/roles.module.js';
import { RawMaterialConsumption } from '../raw.material.consumption/entities/raw.material.consumption.entity.js';
import { Batch } from '../batchs/entities/batch.entity.js';
import { InventoryMovement } from '../inventory.movement/entities/inventory.movement.entity.js';
import { TypeMovement } from '../inventory.movement/entities/type.movement.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([OrderProduction, State, Recipe, RawMaterialConsumption, Batch, InventoryMovement, TypeMovement]), RolesModule],
  controllers: [OrderProductionController, StateController],
  providers: [OrderProductionService, StateService],
  exports: [OrderProductionService, StateService],
})
export class OrderProductionModule {}
