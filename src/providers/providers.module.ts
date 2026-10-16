import { Module } from '@nestjs/common';
import { ProvidersService } from './providers.service.js';
import { ProvidersController } from './providers.controller.js';
import { Provider } from './entities/provider.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchsController } from '../batchs/batchs.controller.js';
import { BatchsService } from '../batchs/batchs.service.js';
import { Batch } from '../batchs/entities/batch.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Batch])],
  controllers: [ProvidersController, BatchsController],
  providers: [ProvidersService, BatchsService],
  exports: [ProvidersService, BatchsService],
})
export class ProvidersModule {}
