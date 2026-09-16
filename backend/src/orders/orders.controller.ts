import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { QueryOrderDto } from './dto/query-order.dto.js';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto.js';
import { OrderEntity } from './entities/order.entity.js';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order (customer_id + items[])' })
  @ApiResponse({ status: 201, description: 'Order created', type: OrderEntity })
  @ApiResponse({ status: 404, description: 'Customer or product not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List orders (paginated, filterable by status/customer_id)' })
  @ApiResponse({ status: 200, description: 'Paginated list of orders with items' })
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID with items and customer' })
  @ApiResponse({ status: 200, description: 'Order found', type: OrderEntity })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Change order status (pending -> completed | cancelled)' })
  @ApiResponse({ status: 200, description: 'Status updated', type: OrderEntity })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 409, description: 'Invalid status transition' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, dto);
  }
}
