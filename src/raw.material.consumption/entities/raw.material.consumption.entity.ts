import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Batch } from '../../batchs/entities/batch.entity.js';
import { OrderProduction } from '../../order.production/entities/order.production.entity.js';

@Entity({ name: 'raw_material_consumptions' })
export class RawMaterialConsumption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number | null;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'varchar', length: 255 })
  observation: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Batch, (batch) => batch.rawMaterials, { nullable: false })
  @JoinColumn({ name: 'batch_id' })
  batch: Relation<Batch>;

  @ManyToOne(() => OrderProduction, (orderProduction) => orderProduction.rawMaterials, { nullable: false })
  @JoinColumn({ name: 'order_production_id' })
  ordersProduction: Relation<OrderProduction>;
}
