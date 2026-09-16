import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrderDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customer_id },
    });
    if (!customer || !customer.isActive) {
      throw new NotFoundException(`Customer #${dto.customer_id} not found`);
    }

    const productIds = dto.items.map((item) => item.product_id);

    const order = await this.prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const productMap = new Map(products.map((product) => [product.id, product]));

      let totalAmount = new Prisma.Decimal(0);
      const itemsData = dto.items.map((item) => {
        const product = productMap.get(item.product_id);
        if (!product || !product.isActive) {
          throw new NotFoundException(`Product #${item.product_id} not found`);
        }
        const unitPrice = product.price;
        const subtotal = unitPrice.mul(item.quantity);
        totalAmount = totalAmount.add(subtotal);
        return {
          productId: product.id,
          productName: product.name,
          unitPrice,
          quantity: item.quantity,
          subtotal,
        };
      });

      return tx.order.create({
        data: {
          customerId: dto.customer_id,
          status: OrderStatus.PENDING,
          totalAmount,
          items: { create: itemsData },
        },
        include: { items: true, customer: true },
      });
    });

    return this.toApiOrder(order);
  }

  async findAll(query: QueryOrderDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.OrderWhereInput = {
      ...(query.status ? { status: query.status.toUpperCase() as OrderStatus } : {}),
      ...(query.customer_id ? { customerId: query.customer_id } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { items: true, customer: true },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: data.map((order) => this.toApiOrder(order)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true, customer: true },
    });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    return this.toApiOrder(order);
  }

  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new ConflictException(
        `Cannot change status from "${order.status.toLowerCase()}" to "${dto.status}". Only pending orders can be completed or cancelled.`,
      );
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status.toUpperCase() as OrderStatus },
      include: { items: true, customer: true },
    });
    return this.toApiOrder(updated);
  }

  private toApiOrder<T extends { status: string }>(order: T): T {
    return { ...order, status: order.status.toLowerCase() };
  }
}
