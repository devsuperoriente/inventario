import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddProductionConsumptionPermission1792790000000 implements MigrationInterface {
  name = 'AddProductionConsumptionPermission1792790000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "roles"
      SET "permissions" = array_append("permissions", 'production-orders:consume')
      WHERE "name" = 'dosificador'
        AND NOT ("permissions" @> ARRAY['production-orders:consume']::text[])
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "roles"
      SET "permissions" = array_remove("permissions", 'production-orders:consume')
      WHERE "name" = 'dosificador'
    `);
  }
}
