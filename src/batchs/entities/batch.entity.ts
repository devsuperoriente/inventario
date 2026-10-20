import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Provider } from '../../providers/entities/provider.entity.js';
import { Product } from '../../products/entities/product.entity.js';
import { InventoryMovement } from '../../inventory.movement/entities/inventory.movement.entity.js';
import { RawMaterialConsumption } from '../../raw.material.consumption/entities/raw.material.consumption.entity.js';

@Entity({ name: 'batches' })
export class Batch {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: false })
  code?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'quantity_initial' })
  quantityInitial: number | null;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'timestamp', name: 'date_matury' })
  dateMatury: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  temperature: number | null;

  @Column({ type: 'varchar', length: 255 })
  observation: string;

  @Column({ type: 'varchar', length: 255 })
  image: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Provider, (provider) => provider.batchs, { nullable: false })
  @JoinColumn({ name: 'provider_id' })
  provider: Relation<Provider>;

  @ManyToOne(() => Product, (product) => product.batchs, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;

  @OneToMany(() => InventoryMovement, (inventoryMovement) => inventoryMovement.batch)
  inventoryMovements: InventoryMovement[];

  @OneToMany(() => RawMaterialConsumption, (rawMaterial) => rawMaterial.batch)
  rawMaterials: RawMaterialConsumption[];
}

/*
Lote
-----
id
codigo_lote

producto_id
proveedor_id

cantidad_inicial
cantidad_disponible
fecha_ingreso
fecha_vencimiento
temperatura_recepcion
imagen
estado

*/
