import { ConflictException, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { OrdersService } from './orders.service.js';

type MockPrisma = {
  customer: { findUnique: jest.Mock };
  product: { findMany: jest.Mock };
  order: {
    create: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    findUnique: jest.Mock;
    update: jest.Mock;
  };
  $transaction: jest.Mock;
};

function createPrismaMock(): MockPrisma {
  return {
    customer: { findUnique: jest.fn() },
    product: { findMany: jest.fn() },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prismaMockRef)),
  };
}

let prismaMockRef: MockPrisma;

describe('OrdersService', () => {
  let service: OrdersService;
  let prisma: MockPrisma;

  beforeEach(() => {
    prisma = createPrismaMock();
    prismaMockRef = prisma;
    service = new OrdersService(prisma as unknown as PrismaService);
  });

  const activeCustomer = {
    id: 1,
    name: 'Acme',
    email: 'acme@example.com',
    isActive: true,
  };

  describe('create', () => {
    it('calculates totalAmount as the sum of item subtotals', async () => {
      prisma.customer.findUnique.mockResolvedValue(activeCustomer);
      prisma.product.findMany.mockResolvedValue([
        { id: 1, name: 'Widget', price: new Prisma.Decimal('10.00'), isActive: true },
        { id: 2, name: 'Gadget', price: new Prisma.Decimal('5.50'), isActive: true },
      ]);
      prisma.order.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 1, ...data, items: data.items.create, customer: activeCustomer }),
      );

      const result = await service.create({
        customer_id: 1,
        items: [
          { product_id: 1, quantity: 2 }, // 20.00
          { product_id: 2, quantity: 3 }, // 16.50
        ],
      });

      expect(result.totalAmount.toString()).toBe('36.5');
      expect(prisma.order.create).toHaveBeenCalledTimes(1);
    });

    it('snapshots productName/unitPrice at creation time, immune to later price changes', async () => {
      prisma.customer.findUnique.mockResolvedValue(activeCustomer);
      const product = { id: 1, name: 'Widget', price: new Prisma.Decimal('10.00'), isActive: true };
      prisma.product.findMany.mockResolvedValue([product]);
      prisma.order.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 1, ...data, items: data.items.create, customer: activeCustomer }),
      );

      const result = await service.create({
        customer_id: 1,
        items: [{ product_id: 1, quantity: 1 }],
      });

      // Mutate the product's price after order creation
      product.price = new Prisma.Decimal('999.00');

      const snapshotItem = result.items[0] as { productName: string; unitPrice: Prisma.Decimal };
      expect(snapshotItem.productName).toBe('Widget');
      expect(snapshotItem.unitPrice.toString()).toBe('10');
    });

    it('throws NotFoundException when the customer does not exist', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);

      await expect(
        service.create({ customer_id: 999, items: [{ product_id: 1, quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when the customer is inactive', async () => {
      prisma.customer.findUnique.mockResolvedValue({ ...activeCustomer, isActive: false });

      await expect(
        service.create({ customer_id: 1, items: [{ product_id: 1, quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when a product does not exist or is inactive', async () => {
      prisma.customer.findUnique.mockResolvedValue(activeCustomer);
      prisma.product.findMany.mockResolvedValue([]);

      await expect(
        service.create({ customer_id: 1, items: [{ product_id: 42, quantity: 1 }] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    const pendingOrder = { id: 1, status: OrderStatus.PENDING };

    it('applies pending -> completed', async () => {
      prisma.order.findUnique.mockResolvedValue(pendingOrder);
      prisma.order.update.mockResolvedValue({
        id: 1,
        status: OrderStatus.COMPLETED,
        items: [],
        customer: activeCustomer,
      });

      const result = await service.updateStatus(1, { status: 'completed' });

      expect(prisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { status: OrderStatus.COMPLETED } }),
      );
      expect(result.status).toBe('completed');
    });

    it('applies pending -> cancelled', async () => {
      prisma.order.findUnique.mockResolvedValue(pendingOrder);
      prisma.order.update.mockResolvedValue({
        id: 1,
        status: OrderStatus.CANCELLED,
        items: [],
        customer: activeCustomer,
      });

      const result = await service.updateStatus(1, { status: 'cancelled' });

      expect(result.status).toBe('cancelled');
    });

    it('throws ConflictException for completed -> cancelled', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.COMPLETED });

      await expect(service.updateStatus(1, { status: 'cancelled' })).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('throws ConflictException for cancelled -> completed', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 1, status: OrderStatus.CANCELLED });

      await expect(service.updateStatus(1, { status: 'completed' })).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.updateStatus(999, { status: 'completed' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
