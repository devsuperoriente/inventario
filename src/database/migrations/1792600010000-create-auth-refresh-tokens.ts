import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuthRefreshTokens1792600010000 implements MigrationInterface {
  name = 'CreateAuthRefreshTokens1792600010000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_refresh_tokens" ("id" SERIAL NOT NULL, "token_hash" character varying(64) NOT NULL, "session_id" uuid NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "revoked_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" integer NOT NULL, CONSTRAINT "UQ_auth_refresh_tokens_hash" UNIQUE ("token_hash"), CONSTRAINT "PK_auth_refresh_tokens_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_auth_refresh_tokens_session_id" ON "auth_refresh_tokens" ("session_id")`);
    await queryRunner.query(
      `ALTER TABLE "auth_refresh_tokens" ADD CONSTRAINT "FK_auth_refresh_tokens_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT "FK_auth_refresh_tokens_user"`);
    await queryRunner.query(`DROP INDEX "IDX_auth_refresh_tokens_session_id"`);
    await queryRunner.query(`DROP TABLE "auth_refresh_tokens"`);
  }
}
