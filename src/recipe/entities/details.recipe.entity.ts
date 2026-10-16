import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Recipe } from './recipe.entity.js';
import { Product } from '../../products/entities/product.entity.js';

@Entity({ name: 'details_recipe' })
export class DetailsRecipe {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  observation: string;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Recipe, (recipe) => recipe.detailsRecipe, { nullable: false })
  @JoinColumn({ name: 'recipe' })
  recipe: Relation<Recipe>;

  @ManyToOne(() => Product, (product) => product.detailsRecipe, { nullable: false })
  @JoinColumn({ name: 'product_id' })
  product: Relation<Product>;
}
