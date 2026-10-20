import { MigrationInterface, QueryRunner } from "typeorm";

export class Update1792415355576 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "order_production"
        ADD COLUMN "user_id" integer
      `);

      await queryRunner.query(`
        ALTER TABLE "order_production"
        ADD CONSTRAINT "FK_order_production_user"
        FOREIGN KEY ("user_id")
        REFERENCES "users"("id")
        ON DELETE SET NULL
        ON UPDATE CASCADE
      `);
  }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`
        ALTER TABLE "order_production"
        DROP CONSTRAINT "FK_order_production_user"
      `);

      await queryRunner.query(`
        ALTER TABLE "order_production"
        DROP COLUMN "user_id"
      `);
    }

}
