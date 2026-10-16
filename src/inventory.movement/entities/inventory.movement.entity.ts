import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Batch } from '../../batchs/entities/batch.entity.js';
import { OrderProduction } from '../../order.production/entities/order.production.entity.js';
import { TypeMovement } from './type.movement.entity.js';

@Entity({ name: 'inventory_movements' })
export class InventoryMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  quantity: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'balance_previus' })
  balancePrevius: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'balance_current' })
  balanceCurrent: number | null;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'varchar', length: 255 })
  observation: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Batch, (batch) => batch.inventoryMovements, { nullable: false })
  @JoinColumn({ name: 'batch_id' })
  batch: Relation<Batch>;

  @ManyToOne(() => OrderProduction, (orderProduction) => orderProduction.invetoryMovements, { nullable: false })
  @JoinColumn({ name: 'order_production_id' })
  ordersProduction: Relation<OrderProduction>;

  @ManyToOne(() => TypeMovement, (typeMovement) => typeMovement.inventoryMovements, { nullable: false })
  @JoinColumn({ name: 'type_movement_id' })
  typeMovement: Relation<TypeMovement>;
}

/*
MovimientoInventario
--------------------
id
lote_id
usuario_id
orden_produccion_id
tipo_movimiento_id

cantidad
saldo_anterior
saldo_actual
motivo
fecha_movimiento
created_at

*/
