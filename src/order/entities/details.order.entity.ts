import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Order } from './order.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Entity({ name: 'details_order' })
export class DetailsOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subtotal: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Order, (order) => order.detailsOrder, { nullable: false })
  @JoinColumn({ name: 'detail_order_id' })
  order: Relation<Order>;

  @ManyToOne(() => Product, (product) => product.detailsOrder, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;
}
