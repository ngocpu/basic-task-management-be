import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialDatabase1766741599770 implements MigrationInterface {
  name = 'InitialDatabase1766741599770';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tasks\` (\`id\` int NOT NULL AUTO_INCREMENT, \`title\` varchar(100) NOT NULL, \`description\` text NULL, \`status\` enum ('OPEN', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'OPEN', \`assignee_id\` int NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`users\` (\`id\` int NOT NULL AUTO_INCREMENT, \`name\` varchar(100) NOT NULL, \`email\` varchar(100) NOT NULL, \`password\` varchar(100) NOT NULL, UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`task_participants\` (\`task_id\` int NOT NULL, \`user_id\` int NOT NULL, INDEX \`IDX_b896bac51dfbca777374da9ff8\` (\`task_id\`), INDEX \`IDX_5e7868877c5f07453cfb73a8a6\` (\`user_id\`), PRIMARY KEY (\`task_id\`, \`user_id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`tasks\` ADD CONSTRAINT \`FK_855d484825b715c545349212c7f\` FOREIGN KEY (\`assignee_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`task_participants\` ADD CONSTRAINT \`FK_b896bac51dfbca777374da9ff8d\` FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`task_participants\` ADD CONSTRAINT \`FK_5e7868877c5f07453cfb73a8a6b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`task_participants\` DROP FOREIGN KEY \`FK_5e7868877c5f07453cfb73a8a6b\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`task_participants\` DROP FOREIGN KEY \`FK_b896bac51dfbca777374da9ff8d\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`tasks\` DROP FOREIGN KEY \`FK_855d484825b715c545349212c7f\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_5e7868877c5f07453cfb73a8a6\` ON \`task_participants\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b896bac51dfbca777374da9ff8\` ON \`task_participants\``,
    );
    await queryRunner.query(`DROP TABLE \`task_participants\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\``,
    );
    await queryRunner.query(`DROP TABLE \`users\``);
    await queryRunner.query(`DROP TABLE \`tasks\``);
  }
}
