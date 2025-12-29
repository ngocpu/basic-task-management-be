import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateEntitiesDatabase1767006207261 implements MigrationInterface {
  name = 'UpdateEntitiesDatabase1767006207261';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tasks\` ADD \`creator_id\` int NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`role\` enum ('ADMIN', 'USER') NOT NULL DEFAULT 'USER'`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tasks\` ADD CONSTRAINT \`FK_f4cb489461bc751498a28852356\` FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`tasks\` DROP FOREIGN KEY \`FK_f4cb489461bc751498a28852356\``,
    );
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`role\``);
    await queryRunner.query(`ALTER TABLE \`tasks\` DROP COLUMN \`creator_id\``);
  }
}
