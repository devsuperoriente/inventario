import { Module } from '@nestjs/common';
import { ProductsService } from './services/products.service.js';
import { ProductsController } from './controllers/products.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity.js';
import { UnitsMeasurement } from './entities/units.measurement.entity.js';
import { Category } from './entities/category.entity.js';
import { CategorysController } from './controllers/categories.controller.js';
import { CategorysService } from './services/categories.service.js';
import { UnitsMeasurementController } from './controllers/units.measurement.controller.js';
import { UnitsMeasurementService } from './services/units.measurement.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, UnitsMeasurement])],
  controllers: [ProductsController, CategorysController, UnitsMeasurementController],
  providers: [ProductsService, CategorysService, UnitsMeasurementService],
  exports: [ProductsService, CategorysService, UnitsMeasurementService],
})
export class ProductsModule {}
