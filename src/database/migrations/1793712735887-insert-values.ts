import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertValues1793712735887 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO "categories" ("name") VALUES ('Materia prima'), ('Producto Final')`);
    await queryRunner.query(`INSERT INTO "type_movements" ("name") VALUES ('ENTRADA'),('SALIDA'),('AJUSTE'), ('MERMA'), ('DEVOLUCION')`);
    await queryRunner.query(`INSERT INTO "units_measurement" ("name", "abbreviation") VALUES ('UNIDAD','und'),('GRAMO','g'),('KILOGRAMO','kg'),('LITRO','l'),('MILILITRO','ml')`);
    await queryRunner.query(`INSERT INTO "states" ("name") VALUES ('PENDIENTE'),('APROBADA'),('EN DOSIFICACION'),('EN PRODUCCION'),('FINALIZADA'),('CANCELADA')`);
    await queryRunner.query(`INSERT INTO "roles" ("name", "permissions") VALUES ('admin', ARRAY['*']), ('supervisor', ARRAY['orders:create']), ('dosificador', ARRAY['production-orders:read']), ('recepcion de materia prima', ARRAY['batches:manage'])`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "roles" WHERE "name" IN ('admin', 'supervisor', 'dosificador', 'recepcion de materia prima')`);
    await queryRunner.query(`DELETE FROM "states" WHERE "name" IN ('PENDIENTE', 'APROBADA', 'EN DOSIFICACION', 'EN PRODUCCION', 'FINALIZADA', 'CANCELADA')`);
    await queryRunner.query(`DELETE FROM "units_measurement" WHERE "name" IN ('UNIDAD', 'GRAMO', 'KILOGRAMO', 'LITRO', 'MILILITRO')`);
    await queryRunner.query(`DELETE FROM "type_movements" WHERE "name" IN ('ENTRADA', 'SALIDA', 'AJUSTE', 'MERMA', 'DEVOLUCION')`);
    await queryRunner.query(`DELETE FROM "categories" WHERE "name" IN ('Materia prima', 'Producto Final')`);
  }

}
