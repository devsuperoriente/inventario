import { Module } from '@nestjs/common';
import { SiesaService } from './services/siesa.service.js';

@Module({
  providers: [SiesaService],
  exports: [SiesaService], // <-- Imprescindible para que otros módulos lo utilicen
})
export class SiesaModule {}
