import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchsService } from './batchs.service.js';
import { BatchsController } from './batchs.controller.js';
import { Batch } from './entities/batch.entity.js';
import { Provider } from '../providers/entities/provider.entity.js';
import { ProvidersController } from '../providers/providers.controller.js';
import { ProvidersService } from '../providers/providers.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Batch, Provider])],
  controllers: [BatchsController, ProvidersController],
  providers: [BatchsService, ProvidersService],
  exports: [BatchsService, ProvidersService],
})
export class BatchsModule {}
