import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ProductsService } from './products.service.js';

function createPrismaMock() {
  return {
    product: {
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

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: ReturnType<typeof createPrismaMock>;

  beforeEach(() => {
    prisma = createPrismaMock();
    service = new ProductsService(prisma as unknown as PrismaService);
  });

  describe('remove', () => {
    it('soft-deletes by setting isActive=false and never calls delete', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 1, isActive: true });
      prisma.product.update.mockResolvedValue({ id: 1, isActive: false });

      await service.remove(1);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { isActive: false },
      });
      expect(prisma.product.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for a product that does not exist', async () => {
      prisma.product.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(prisma.product.delete).not.toHaveBeenCalled();
      expect(prisma.product.update).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException for a product that is soft-deleted (isActive=false)', async () => {
      prisma.product.findUnique.mockResolvedValue({ id: 1, isActive: false });

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });
});
