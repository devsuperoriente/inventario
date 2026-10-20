import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { State } from './state.entity.js';
import { Product } from '../../products/entities/product.entity.js';
import { RawMaterialConsumption } from '../../raw.material.consumption/entities/raw.material.consumption.entity.js';
import { InventoryMovement } from '../../inventory.movement/entities/inventory.movement.entity.js';
import { User } from '../../users/entities/user.entity.js';

@Entity({ name: 'order_production' })
export class OrderProduction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'number_order' })
  numberOrder?: string;

  @Column({ type: 'timestamp', name: 'date_order' })
  date: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'quantity_sheduled' })
  quantitySheduled: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'quantity_produced' })
  quantityProduced: number;

  @Column({ type: 'varchar', length: 255, nullable:true })
  observation: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => State, (state) => state.ordersProduction, { nullable: false })
  @JoinColumn({ name: 'state_id' })
  state: Relation<State>;

  @ManyToOne(() => Product, (product) => product.ordersProduction, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @ManyToOne(() => User, (user) => user.ordersProduction, { nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;

  @OneToMany(() => RawMaterialConsumption, (rawMaterial) => rawMaterial.ordersProduction)
  rawMaterials: RawMaterialConsumption[];

  @OneToMany(() => InventoryMovement, (invetoryMovement) => invetoryMovement.ordersProduction)
  invetoryMovements: InventoryMovement[];
}

/*
usuario_id
consumo_id
movimiento_id
*/
