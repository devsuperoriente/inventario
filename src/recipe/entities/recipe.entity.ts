import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Product } from '../../products/entities/product.entity.js';
import { DetailsRecipe } from './details.recipe.entity.js';

@Entity({ name: 'recipes' })
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  code?: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 30 })
  version: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1, name: 'base_yield' })
  baseYield: number;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @OneToOne(() => Product, (product) => product.recipe, { nullable: true })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product> | null;

  @OneToMany(() => DetailsRecipe, (detail) => detail.recipe)
  detailsRecipe: DetailsRecipe[];
}
