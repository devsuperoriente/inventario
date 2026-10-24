import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1792776751676 implements MigrationInterface {
  name = 'Init1792776751676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "observation" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "observation" SET NOT NULL`);
  }
}
