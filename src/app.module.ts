import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Env } from './env.model.js';
import { RecipeModule } from './recipe/recipe.module.js';
import { ProductsModule } from './products/products.module.js';
import { ProvidersModule } from './providers/providers.module.js';
import { OrderModule } from './order/order.module.js';
import { ClientModule } from './client/client.module.js';
import { OrderProductionModule } from './order.production/order.production.module.js';
import { InventoryMovementModule } from './inventory.movement/inventory.movement.module.js';
import { RawMaterialConsumptionModule } from './raw.material.consumption/raw.material.consumption.module.js';
import { BatchsModule } from './batchs/batchs.module.js';
import { AuthModule } from './auth/auth.module.js';
import { RolesModule } from './roles/roles.module.js';
import { SiesaModule } from './siesa/siesa.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService<Env>) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST', { infer: true }),
        port: configService.get('POSTGRES_PORT', { infer: true }),
        username: configService.get('POSTGRES_USER', { infer: true }),
        password: configService.get('POSTGRES_PASSWORD', { infer: true }),
        database: configService.get('POSTGRES_DB', { infer: true }),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ProvidersModule,
    ProductsModule,
    RecipeModule,
    OrderModule,
    ClientModule,
    OrderProductionModule,
    BatchsModule,
    RawMaterialConsumptionModule,
    InventoryMovementModule,
    AuthModule,
    RolesModule,
    SiesaModule,
  ],
})
export class AppModule {}
