import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class User1709864174745 implements MigrationInterface {
    name = 'User1709864174745'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "user" ADD COLUMN "email" varchar varchar`);
        await queryRunner.addColumn('user', {
            name: 'email',
            type: 'varchar',
            isNullable: true,
            '@instanceof': undefined,
            isGenerated: false,
            isPrimary: false,
            isUnique: false,
            isArray: false,
            length: '',
            zerofill: false,
            unsigned: false,
            clone: function (): TableColumn {
                throw new Error('Function not implemented.')
            }
        })
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "email"`);
        await queryRunner.dropColumn('user', 'email')
    }
}
