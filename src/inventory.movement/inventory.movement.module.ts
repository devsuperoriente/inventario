import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryMovementService } from './services/inventory.movement.service.js';
import { InventoryMovementController } from './controllers/inventory.movement.controller.js';
import { InventoryMovement } from './entities/inventory.movement.entity.js';
import { TypeMovement } from './entities/type.movement.entity.js';
import { TypeMovementController } from './controllers/type.movement.controller.js';
import { TypeMovementService } from './services/type.movement.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryMovement, TypeMovement])],
  controllers: [InventoryMovementController, TypeMovementController],
  providers: [InventoryMovementService, TypeMovementService],
  exports: [InventoryMovementService, TypeMovementService],
})
export class InventoryMovementModule {}
