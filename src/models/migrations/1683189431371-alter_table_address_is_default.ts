import {MigrationInterface, QueryRunner} from "typeorm";

export class alterTableAddressIsDefault1683189431371 implements MigrationInterface {
    name = 'alterTableAddressIsDefault1683189431371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_address" ADD "isDefault" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_address" DROP COLUMN "isDefault"`);
    }

}
