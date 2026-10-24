import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1792771505441 implements MigrationInterface {
  name = 'Init1792771505441';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "recipes" ("id" SERIAL NOT NULL, "code" character varying(100), "name" character varying(30) NOT NULL, "description" character varying(255), "version" character varying(30) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "base_yield" numeric(10,2) NOT NULL DEFAULT '1', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "product_id" integer, CONSTRAINT "UQ_dcf93c3e497af5c56bc8312be80" UNIQUE ("name"), CONSTRAINT "UQ_d0b2e273b43cdf9c3a57ed5bfd1" UNIQUE ("version"), CONSTRAINT "REL_f64cfae3dc201348f591b4bf22" UNIQUE ("product_id"), CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "details_recipe" ("id" SERIAL NOT NULL, "amount" numeric(10,2), "observation" character varying(30), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recipe" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_4a793825d3080600c3f509728c1" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "recipes" ADD CONSTRAINT "FK_f64cfae3dc201348f591b4bf221" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "details_recipe" ADD CONSTRAINT "FK_0ff8ead17014cfcd825d30fea84" FOREIGN KEY ("recipe") REFERENCES "recipes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "details_recipe" ADD CONSTRAINT "FK_89ac4a11db4b37e75d17be40821" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "details_recipe" DROP CONSTRAINT "FK_89ac4a11db4b37e75d17be40821"`);
    await queryRunner.query(`ALTER TABLE "details_recipe" DROP CONSTRAINT "FK_0ff8ead17014cfcd825d30fea84"`);
    await queryRunner.query(`ALTER TABLE "recipes" DROP CONSTRAINT "FK_f64cfae3dc201348f591b4bf221"`);
    await queryRunner.query(`DROP TABLE "details_recipe"`);
    await queryRunner.query(`DROP TABLE "recipes"`);
  }
}
