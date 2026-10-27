import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1793033080658 implements MigrationInterface {
  name = 'Init1793033080658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipes" DROP CONSTRAINT "UQ_d0b2e273b43cdf9c3a57ed5bfd1"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recipes" ADD CONSTRAINT "UQ_d0b2e273b43cdf9c3a57ed5bfd1" UNIQUE ("version")`);
  }
}
