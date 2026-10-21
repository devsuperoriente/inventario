import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Client } from '../../client/entities/client.entity.js';
import { DetailsOrder } from './details.order.entity.js';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, name: 'number_order', nullable: true })
  numberOrder: string;

  @Column({ type: 'timestamp', name: 'date_order' })
  dateOrder: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Client, (client) => client.orders, { nullable: false })
  @JoinColumn({ name: 'client_id' })
  client: Relation<Client>;

  @OneToMany(() => DetailsOrder, (detail) => detail.order)
  detailsOrder: DetailsOrder[];
}
