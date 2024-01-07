import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as supertest from 'supertest';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { UsersModule } from './users.module';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";

describe('User', () => {
  let app: INestApplication;
  let repository: Repository<User>;
  let postgresContainer: StartedPostgreSqlContainer;

  jest.setTimeout(60000);

  beforeAll(async () => {
    postgresContainer = await new PostgreSqlContainer()
      .withDatabase('e2e_test')
      .withUsername('root')
      .withPassword('password')
      .start();

    const module = await Test.createTestingModule({
      imports: [
        UsersModule,
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: postgresContainer.getHost(),
          port: postgresContainer.getMappedPort(5432),
          username: postgresContainer.getUsername(),
          password: postgresContainer.getPassword(),
          database: 'e2e_test',
          entities: ['src/**/*.entity.{ts,js}'],
          migrations: ['src/migrations/*.{ts,js}'],
          migrationsRun: true,
          synchronize: false,
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    repository = module.get<Repository<User>>('UserRepository');
    await app.init();
  });

  afterEach(async () => {
    await repository.query(`DELETE FROM users;`);
  });

  afterAll(async () => {
    await app.close();
    await postgresContainer.stop();
  });

  describe('GET /users', () => {
    it('should return an array of users', async () => {
      await repository.save([{ name: 'test-name-0' }, { name: 'test-name-1' }]);
      const { body } = await supertest
        .agent(app.getHttpServer())
        .get('/users')
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200);
      expect(body).toEqual([
        { id: expect.any(Number), name: 'test-name-0' },
        { id: expect.any(Number), name: 'test-name-1' },
      ]);
    });
  });

  // describe('POST /users', () => {
  //   it('should return a user', async () => {
  //     const { body } = await supertest
  //       .agent(app.getHttpServer())
  //       .post('/users')
  //       .set('Accept', 'application/json')
  //       .send({ name: 'test-name' })
  //       .expect('Content-Type', /json/)
  //       .expect(201);
  //     expect(body).toEqual({ id: expect.any(Number), name: 'test-name' });
  //   });
  //
  //   it('should create a user is the DB', async () => {
  //     await expect(repository.findAndCount()).resolves.toEqual([[], 0]);
  //     await supertest
  //       .agent(app.getHttpServer())
  //       .post('/users')
  //       .set('Accept', 'application/json')
  //       .send({ name: 'test-name' })
  //       .expect('Content-Type', /json/)
  //       .expect(201);
  //     await expect(repository.findAndCount()).resolves.toEqual([
  //       [{ id: expect.any(Number), name: 'test-name' }],
  //       1,
  //     ]);
  //   });
  //
  //   it('should handle a missing name', async () => {
  //     await supertest
  //       .agent(app.getHttpServer())
  //       .post('/users')
  //       .set('Accept', 'application/json')
  //       .send({ none: 'test-none' })
  //       .expect('Content-Type', /json/)
  //       .expect(500);
  //   });
  // });
});