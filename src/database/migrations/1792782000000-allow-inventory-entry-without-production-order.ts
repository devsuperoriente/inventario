import { MigrationInterface, QueryRunner } from 'typeorm';

export class AllowInventoryEntryWithoutProductionOrder1792782000000 implements MigrationInterface {
  name = 'AllowInventoryEntryWithoutProductionOrder1792782000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inventory_movements" ALTER COLUMN "order_production_id" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "inventory_movements" ALTER COLUMN "order_production_id" SET NOT NULL`);
  }
}
