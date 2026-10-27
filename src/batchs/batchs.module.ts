import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchsService } from './services/batchs.service.js';
import { BatchsController } from './controllers/batchs.controller.js';
import { Batch } from './entities/batch.entity.js';
import { Provider } from '../providers/entities/provider.entity.js';
import { ProvidersController } from '../providers/controllers/providers.controller.js';
import { ProvidersService } from '../providers/services/providers.service.js';
import { RolesModule } from '../roles/roles.module.js';
import { InventoryMovement } from '../inventory.movement/entities/inventory.movement.entity.js';
import { TypeMovement } from '../inventory.movement/entities/type.movement.entity.js';
import { SiesaModule } from '../siesa/siesa.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Batch, Provider, InventoryMovement, TypeMovement]), SiesaModule, RolesModule],
  controllers: [BatchsController, ProvidersController],
  providers: [BatchsService, ProvidersService],
  exports: [BatchsService, ProvidersService],
})
export class BatchsModule {}
