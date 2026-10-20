import { Module } from '@nestjs/common';
import { ProvidersController } from './controllers/providers.controller.js';
import { Provider } from './entities/provider.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchsController } from '../batchs/controllers/batchs.controller.js';
import { BatchsService } from '../batchs/services/batchs.service.js';
import { Batch } from '../batchs/entities/batch.entity.js';
import { ProvidersService } from './services/providers.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Provider, Batch])],
  controllers: [ProvidersController, BatchsController],
  providers: [ProvidersService, BatchsService],
  exports: [ProvidersService, BatchsService],
})
export class ProvidersModule {}
