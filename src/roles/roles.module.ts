import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { Role } from './entities/role.entity.js';
import { RolesController } from './controllers/roles.controller.js';
import { RolesGuard } from './guards/roles.guard.js';
import { RolesService } from './services/roles.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RolesController],
  providers: [RolesService, RolesGuard, JwtAuthGuard],
  exports: [RolesService, RolesGuard, JwtAuthGuard],
})
export class RolesModule {}
