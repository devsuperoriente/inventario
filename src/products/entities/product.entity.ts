import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Category } from './category.entity.js';
import { UnitsMeasurement } from './units.measurement.entity.js';
import { DetailsRecipe } from '../../recipe/entities/details.recipe.entity.js';
import { DetailsOrder } from '../../order/entities/details.order.entity.js';
import { OrderProduction } from '../../order.production/entities/order.production.entity.js';
import { Batch } from '../../batchs/entities/batch.entity.js';

@Entity({ name: 'products' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  code: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'price_before_tax' })
  priceBeforeTax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'price_after_tax' })
  priceAfterTax: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  tax: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'stock_min' })
  stockMin: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Category, (category) => category.products, { nullable: false })
  @JoinColumn({ name: 'category_id' })
  category: Relation<Category>;

  @ManyToOne(() => UnitsMeasurement, (unitsMeasurement) => unitsMeasurement.products, { nullable: false })
  @JoinColumn({ name: 'units_measurement_id' })
  unitsMeasurement: Relation<UnitsMeasurement>;

  @OneToMany(() => DetailsRecipe, (detail) => detail.product)
  detailsRecipe: DetailsRecipe[];

  @OneToMany(() => DetailsOrder, (detail) => detail.product)
  detailsOrder: Relation<DetailsOrder>[];

  @OneToMany(() => OrderProduction, (orderProduction) => orderProduction.product)
  ordersProduction: OrderProduction[];

  @OneToMany(() => Batch, (batch) => batch.product)
  batchs: Batch[];
}
