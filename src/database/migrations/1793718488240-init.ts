import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1793718488240 implements MigrationInterface {
    name = 'Init1793718488240'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "quantity_in_grams" numeric(10,2)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "quantity_in_grams"`);
    }

}
