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

describe('Orders (e2e)', () => {
  const suffix = Date.now();
  let customerId: number;
  let productId: number;
  let orderId: number;

  beforeAll(async () => {
    const customerRes = await request(BASE_URL)
      .post('/customers')
      .send({ name: 'E2E Customer', email: `e2e-${suffix}@example.com` })
      .expect(201);
    customerId = customerRes.body.id;

    const productRes = await request(BASE_URL)
      .post('/products')
      .send({ name: `E2E Widget ${suffix}`, price: 25 })
      .expect(201);
    productId = productRes.body.id;
  });

  it('POST /orders with a nonexistent customer returns 404', async () => {
    await request(BASE_URL)
      .post('/orders')
      .send({ customer_id: 999999, items: [{ product_id: productId, quantity: 1 }] })
      .expect(404);
  });

  it('POST /orders with quantity 0 is rejected with 400', async () => {
    await request(BASE_URL)
      .post('/orders')
      .send({ customer_id: customerId, items: [{ product_id: productId, quantity: 0 }] })
      .expect(400);
  });

  it('POST /orders with negative quantity is rejected with 400', async () => {
    await request(BASE_URL)
      .post('/orders')
      .send({ customer_id: customerId, items: [{ product_id: productId, quantity: -1 }] })
      .expect(400);
  });

  it('happy path: creates an order with the correct total/items, then completes it', async () => {
    const createRes = await request(BASE_URL)
      .post('/orders')
      .send({ customer_id: customerId, items: [{ product_id: productId, quantity: 3 }] })
      .expect(201);

    orderId = createRes.body.id;
    expect(createRes.body.status).toBe('pending');
    expect(createRes.body.total_amount).toBe(75);
    expect(createRes.body.items).toHaveLength(1);
    expect(createRes.body.items[0].product_name).toContain('E2E Widget');
    expect(createRes.body.items[0].unit_price).toBe(25);

    const completeRes = await request(BASE_URL)
      .patch(`/orders/${orderId}/status`)
      .send({ status: 'completed' })
      .expect(200);
    expect(completeRes.body.status).toBe('completed');

    const getRes = await request(BASE_URL).get(`/orders/${orderId}`).expect(200);
    expect(getRes.body.status).toBe('completed');
  });

  it('PATCH /orders/:id/status with an invalid transition (completed -> cancelled) returns 409', async () => {
    await request(BASE_URL)
      .patch(`/orders/${orderId}/status`)
      .send({ status: 'cancelled' })
      .expect(409);
  });
});
