import {MigrationInterface, QueryRunner} from "typeorm";

export class alterTableAddress1683199816435 implements MigrationInterface {
    name = 'alterTableAddress1683199816435'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_address" DROP COLUMN "district"`);
        await queryRunner.query(`ALTER TABLE "users_address" DROP COLUMN "sub_district"`);
        await queryRunner.query(`ALTER TABLE "users_address" ADD "zipcode" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_address" DROP COLUMN "zipcode"`);
        await queryRunner.query(`ALTER TABLE "users_address" ADD "sub_district" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users_address" ADD "district" character varying NOT NULL`);
    }

}
