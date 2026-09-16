import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CustomersService } from './customers.service.js';

function createPrismaMock() {
  return {
    customer: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
}

describe('CustomersService', () => {
  let service: CustomersService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new CustomersService(prisma as unknown as PrismaService);
  });

  describe('remove', () => {
    it('soft-deletes by setting isActive=false and never calls delete', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 1, isActive: true });
      prisma.customer.update.mockResolvedValue({ id: 1, isActive: false });

      await service.remove(1);

      expect(prisma.customer.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(prisma.customer.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a customer that does not exist', async () => {
      prisma.customer.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(prisma.customer.delete).not.toHaveBeenCalled();
      expect(prisma.customer.update).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for a customer that is soft-deleted (isActive=false)', async () => {
      prisma.customer.findUnique.mockResolvedValue({ id: 1, isActive: false });

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
