import {MigrationInterface, QueryRunner} from "typeorm";

export class alterTableBanksIsDefault1683189891109 implements MigrationInterface {
    name = 'alterTableBanksIsDefault1683189891109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banks" ADD "isDefault" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "banks" DROP COLUMN "isDefault"`);
    }

}
