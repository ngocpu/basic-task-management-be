import { config } from 'dotenv';
import path from 'node:path';
import { DataSource } from 'typeorm';

config();
export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number.parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  connectorPackage: 'mysql2',
  entities: [path.join(process.cwd(), 'src/**/*.entity.ts')],
  migrations: [path.join(process.cwd(), 'src/database/migrations/*.ts')],
});
