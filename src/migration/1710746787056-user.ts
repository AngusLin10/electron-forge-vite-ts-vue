import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class User1710746787056 implements MigrationInterface {
    name = 'User1710746787056'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn('user', {
            name: 'path',
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
        await queryRunner.dropColumn('user', 'path')
    }

}
