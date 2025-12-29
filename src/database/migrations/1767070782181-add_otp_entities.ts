import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOtpEntities1767070782181 implements MigrationInterface {
  name = 'AddOtpEntities1767070782181';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`otp\` (\`id\` int NOT NULL AUTO_INCREMENT, \`email\` varchar(255) NOT NULL, \`code\` varchar(255) NOT NULL, \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP, \`expireAt\` timestamp NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`isVerified\` tinyint NOT NULL DEFAULT 0`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE \`users\` ADD \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`updatedAt\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`createdAt\``);
    await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`isVerified\``);
    await queryRunner.query(`DROP TABLE \`otp\``);
  }
}
