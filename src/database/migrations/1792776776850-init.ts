import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1792776776850 implements MigrationInterface {
  name = 'Init1792776776850';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "imageUrl" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batches" ALTER COLUMN "imageUrl" SET NOT NULL`);
  }
}
