import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1792584934294 implements MigrationInterface {
  name = 'Init1792584934294';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "providers" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "nit" character varying(30) NOT NULL, "address" character varying(200), "phone" character varying(20), "email" character varying(100), "website" character varying(200), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8715a5ecbda8109fa526177a827" UNIQUE ("nit"), CONSTRAINT "PK_af13fc2ebf382fe0dad2e4793aa" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "categories" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "units_measurement" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "abbreviation" character varying(30) NOT NULL, "description" character varying(30), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6fb450d1fd19b7487658afc6092" UNIQUE ("abbreviation"), CONSTRAINT "PK_49f7f0c89bb8b0f1bff69dec2cf" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "recipes" ("id" SERIAL NOT NULL, "code" character varying(100) NOT NULL, "name" character varying(30) NOT NULL, "description" character varying(30), "version" character varying(30) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_dcf93c3e497af5c56bc8312be80" UNIQUE ("name"), CONSTRAINT "UQ_d0b2e273b43cdf9c3a57ed5bfd1" UNIQUE ("version"), CONSTRAINT "PK_8f09680a51bf3669c1598a21682" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "details_recipe" ("id" SERIAL NOT NULL, "amount" numeric(10,2), "observation" character varying(30), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "recipe" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_4a793825d3080600c3f509728c1" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "clients" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "nit" character varying(30) NOT NULL, "address" character varying(200), "phone" character varying(20), "email" character varying(100), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_439b735c299b09eabb32e080d73" UNIQUE ("nit"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "orders" ("id" SERIAL NOT NULL, "number_order" character varying(100), "date_order" TIMESTAMP NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "client_id" integer NOT NULL, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "details_order" ("id" SERIAL NOT NULL, "amount" numeric(10,2), "price" numeric(10,2), "subtotal" numeric(10,2), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "order_id" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_d0a06e2222210bb9a50d83a6e7b" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "states" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "raw_material_consumptions" ("id" SERIAL NOT NULL, "quantity" numeric(10,2), "date" TIMESTAMP NOT NULL, "observation" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "batch_id" integer NOT NULL, "order_production_id" integer NOT NULL, CONSTRAINT "PK_8a294c031325006e0f49ae56c60" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "type_movements" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_24a3d2832ef8ca43f9545a11ada" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "inventory_movements" ("id" SERIAL NOT NULL, "quantity" numeric(10,2), "balance_previus" numeric(10,2), "balance_current" numeric(10,2), "date" TIMESTAMP NOT NULL, "observation" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "batch_id" integer NOT NULL, "order_production_id" integer NOT NULL, "type_movement_id" integer NOT NULL, CONSTRAINT "PK_d7597827c1dcffae889db3ab873" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "profiles" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "lastName" character varying(100), "phone" character varying(100), "address" character varying(100), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying(100) NOT NULL, "password" character varying(100) NOT NULL, "email" character varying(100), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "profile_id" integer NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "REL_23371445bd80cb3e413089551b" UNIQUE ("profile_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "order_production" ("id" SERIAL NOT NULL, "number_order" character varying(100) NOT NULL, "date_order" TIMESTAMP NOT NULL, "quantity_sheduled" numeric(10,2), "quantity_produced" numeric(10,2), "observation" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "state_id" integer NOT NULL, "product_id" integer NOT NULL, "user_id" integer NOT NULL, CONSTRAINT "UQ_d98d5065af86153f3103421dd2d" UNIQUE ("number_order"), CONSTRAINT "PK_0e1164d3b077a579e62ff72a313" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "products" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "code" character varying(30) NOT NULL, "price_before_tax" numeric(10,2), "price_after_tax" numeric(10,2), "tax" numeric(5,2), "stock_min" numeric(10,2), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "category_id" integer NOT NULL, "units_measurement_id" integer NOT NULL, CONSTRAINT "UQ_7cfc24d6c24f0ec91294003d6b8" UNIQUE ("code"), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "batches" ("id" SERIAL NOT NULL, "code" character varying(100) NOT NULL, "quantity_initial" numeric(10,2), "date" TIMESTAMP NOT NULL, "date_matury" TIMESTAMP NOT NULL, "temperature" numeric(10,2), "observation" character varying(255) NOT NULL, "image" character varying(255) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "provider_id" integer NOT NULL, "product_id" integer NOT NULL, CONSTRAINT "PK_55e7ff646e969b61d37eea5be7a" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "details_recipe" ADD CONSTRAINT "FK_0ff8ead17014cfcd825d30fea84" FOREIGN KEY ("recipe") REFERENCES "recipes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "details_recipe" ADD CONSTRAINT "FK_89ac4a11db4b37e75d17be40821" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_505ba3689ef2763acd6c4fc93a4" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "details_order" ADD CONSTRAINT "FK_b58daf7765d6acc09f6cc2381a9" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "details_order" ADD CONSTRAINT "FK_297e820610fa3fa11bf7c688ca6" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "raw_material_consumptions" ADD CONSTRAINT "FK_6a885488c93543177c8e702fdbc" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "raw_material_consumptions" ADD CONSTRAINT "FK_f0b687e2db793588f35efcec927" FOREIGN KEY ("order_production_id") REFERENCES "order_production"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_0d8d237c78afa95bb19afcb5172" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_e621945012d97f002179e835f8c" FOREIGN KEY ("order_production_id") REFERENCES "order_production"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "inventory_movements" ADD CONSTRAINT "FK_35a2611f37b132d82de6ba66481" FOREIGN KEY ("type_movement_id") REFERENCES "type_movements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_23371445bd80cb3e413089551bf" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "order_production" ADD CONSTRAINT "FK_a3c5c39cb7095c96306dde45292" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "order_production" ADD CONSTRAINT "FK_bb42c622003ffcc4c6e2c6b17b4" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "order_production" ADD CONSTRAINT "FK_c0e86c1078db5d0b0e845a71765" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "products" ADD CONSTRAINT "FK_51b776ca66ff956063058449535" FOREIGN KEY ("units_measurement_id") REFERENCES "units_measurement"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "batches" ADD CONSTRAINT "FK_b813bb80450dc446b4327ca9837" FOREIGN KEY ("provider_id") REFERENCES "providers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "batches" ADD CONSTRAINT "FK_07ad38527d0d87601f3b05a6a22" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "batches" DROP CONSTRAINT "FK_07ad38527d0d87601f3b05a6a22"`);
    await queryRunner.query(`ALTER TABLE "batches" DROP CONSTRAINT "FK_b813bb80450dc446b4327ca9837"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_51b776ca66ff956063058449535"`);
    await queryRunner.query(`ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`);
    await queryRunner.query(`ALTER TABLE "order_production" DROP CONSTRAINT "FK_c0e86c1078db5d0b0e845a71765"`);
    await queryRunner.query(`ALTER TABLE "order_production" DROP CONSTRAINT "FK_bb42c622003ffcc4c6e2c6b17b4"`);
    await queryRunner.query(`ALTER TABLE "order_production" DROP CONSTRAINT "FK_a3c5c39cb7095c96306dde45292"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_23371445bd80cb3e413089551bf"`);
    await queryRunner.query(`ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_35a2611f37b132d82de6ba66481"`);
    await queryRunner.query(`ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_e621945012d97f002179e835f8c"`);
    await queryRunner.query(`ALTER TABLE "inventory_movements" DROP CONSTRAINT "FK_0d8d237c78afa95bb19afcb5172"`);
    await queryRunner.query(`ALTER TABLE "raw_material_consumptions" DROP CONSTRAINT "FK_f0b687e2db793588f35efcec927"`);
    await queryRunner.query(`ALTER TABLE "raw_material_consumptions" DROP CONSTRAINT "FK_6a885488c93543177c8e702fdbc"`);
    await queryRunner.query(`ALTER TABLE "details_order" DROP CONSTRAINT "FK_297e820610fa3fa11bf7c688ca6"`);
    await queryRunner.query(`ALTER TABLE "details_order" DROP CONSTRAINT "FK_b58daf7765d6acc09f6cc2381a9"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_505ba3689ef2763acd6c4fc93a4"`);
    await queryRunner.query(`ALTER TABLE "details_recipe" DROP CONSTRAINT "FK_89ac4a11db4b37e75d17be40821"`);
    await queryRunner.query(`ALTER TABLE "details_recipe" DROP CONSTRAINT "FK_0ff8ead17014cfcd825d30fea84"`);
    await queryRunner.query(`DROP TABLE "batches"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "order_production"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "profiles"`);
    await queryRunner.query(`DROP TABLE "inventory_movements"`);
    await queryRunner.query(`DROP TABLE "type_movements"`);
    await queryRunner.query(`DROP TABLE "raw_material_consumptions"`);
    await queryRunner.query(`DROP TABLE "states"`);
    await queryRunner.query(`DROP TABLE "details_order"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "clients"`);
    await queryRunner.query(`DROP TABLE "details_recipe"`);
    await queryRunner.query(`DROP TABLE "recipes"`);
    await queryRunner.query(`DROP TABLE "units_measurement"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "providers"`);
  }
}
