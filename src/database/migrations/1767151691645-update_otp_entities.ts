import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateOtpEntities1767151691645 implements MigrationInterface {
  name = 'UpdateOtpEntities1767151691645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`otp\` ADD \`otpType\` enum ('VERIFICATION', 'RESET_PASSWORD', 'FORGOT_PASSWORD') NOT NULL DEFAULT 'VERIFICATION'`,
    );
    await queryRunner.query(`ALTER TABLE \`otp\` DROP COLUMN \`code\``);
    await queryRunner.query(
      `ALTER TABLE \`otp\` ADD \`code\` varchar(6) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX \`IDX_463cf01e0ea83ad57391fd4e1d\` ON \`otp\` (\`email\`)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX \`IDX_463cf01e0ea83ad57391fd4e1d\` ON \`otp\``,
    );
    await queryRunner.query(`ALTER TABLE \`otp\` DROP COLUMN \`code\``);
    await queryRunner.query(
      `ALTER TABLE \`otp\` ADD \`code\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE \`otp\` DROP COLUMN \`otpType\``);
  }
}
