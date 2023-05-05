import * as dotenv from 'dotenv';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
dotenv.config();

const dir = process.env.NODE_ENV == 'migration' ? 'src' : 'dist';
export default <TypeOrmModuleOptions>{
  type: process.env.DATABASE_CONNECTION,
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  // logger: "advanced-console",
  // logging:"all",
  entities: [`${dir}/**/*.entity.{js,ts}`],
  migrations: [`${dir}/models/migrations/*.{js,ts}`],
  seeds: [`${dir}/models/migrations/seeds/*.seed.{js,ts}`],
  factories: [`${dir}/models/migrations/seeds/factories/*.factory.{js,ts}`],
  cli: {
    migrationsDir: `${dir}/models/migrations`,
    entitiesDir: `${dir}/models/entities`,
    seedersDir: `${dir}/models/migrations/seeds`,
    factoriesDir: `${dir}/models/migrations/seeds/factories`,
  },
  synchronize: false,
  migrationsRun: false,
};
