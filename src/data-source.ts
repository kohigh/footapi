import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from "./users/user.entity";

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'root',
  password: 'password',
  database: 'foot',
  entities: ['src/**/*.entity.{ts,js}'],
  migrations: ['src/migrations/*.{ts,js}'],
  synchronize: false,
};

export const dataSource = new DataSource(dataSourceOptions);