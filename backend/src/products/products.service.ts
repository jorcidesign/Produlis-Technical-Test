import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import { QueryProductDto } from './dto/query-product.dto.js';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    if (dto.sku) {
      const existing = await this.prisma.product.findUnique({
        where: { sku: dto.sku },
      });
      if (existing) {
        throw new ConflictException(`SKU "${dto.sku}" is already in use`);
      }
    }
    return this.prisma.product.create({ data: dto });
  }

  async findAll(query: QueryProductDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      isActive: true,
      ...(query.search ? { name: { contains: query.search } } : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product || !product.isActive) {
      throw new NotFoundException(`Product #${id} not found`);
    }
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    if (dto.sku) {
      const conflict = await this.prisma.product.findFirst({
        where: { sku: dto.sku, NOT: { id } },
      });
      if (conflict) {
        throw new ConflictException(`SKU "${dto.sku}" is already in use`);
      }
    }
    return this.prisma.product.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
