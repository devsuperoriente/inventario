import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1792513688149 implements MigrationInterface {
    name = 'Init1792513688149'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "number_order" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "number_order" SET NOT NULL`);
    }

}
