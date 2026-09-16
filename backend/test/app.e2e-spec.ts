import request from 'supertest';

/**
 * Black-box e2e: hits a real running server instead of bootstrapping the
 * Nest app in-process. Prisma 7's driver-adapter WASM query compiler does
 * not load correctly inside Jest's --experimental-vm-modules sandbox, so
 * any in-process test that instantiates PrismaService hangs/crashes.
 *
 * Precondition: the backend (and MySQL) must already be running —
 * `npm run start:dev` or `docker compose up -d mysql backend`.
 */
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3001';

describe('AppController (e2e)', () => {
  it('/ (GET)', () => {
    return request(BASE_URL).get('/').expect(200).expect('Hello World!');
  });
});
