import type { Metadata } from "next";
import Link from "next/link";
import { getOrders, getAllCustomers } from "@/services/api";
import { DataTable, type Column } from "@/components/organisms/data-table";
import { PageHeader } from "@/components/organisms/page-header";
import { Pagination } from "@/components/organisms/pagination";
import { OrderFilters } from "@/components/organisms/order-filters";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import type { Order } from "@/services/api";

export const metadata: Metadata = { title: "Órdenes" };

const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
const dateFmt = new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" });

const statusVariant = {
  pending: "secondary",
  completed: "default",
  cancelled: "destructive",
} as const;

const statusLabel = {
  pending: "Pendiente",
  completed: "Completada",
  cancelled: "Cancelada",
} as const;

interface PageProps {
  searchParams: Promise<{
    page?: string;
    status?: string;
    customer_id?: string;
  }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const status = params.status;
  const customer_id = params.customer_id ? parseInt(params.customer_id, 10) : undefined;

  const [{ data: orders, total_pages, total }, customers] = await Promise.all([
    getOrders({ page, status, customer_id }),
    getAllCustomers(),
  ]);

  const columns: Column<Order>[] = [
    { key: "id", label: "#" },
    {
      key: "customer",
      label: "Cliente",
      render: (row: Order) => row.customer?.name ?? `ID: ${row.customer_id}`,
    },
    {
      key: "status",
      label: "Estado",
      render: (row: Order) => (
        <Badge variant={statusVariant[row.status]}>
          {statusLabel[row.status]}
        </Badge>
      ),
    },
    {
      key: "total_amount",
      label: "Total",
      render: (row: Order) => fmt.format(row.total_amount),
    },
    {
      key: "created_at",
      label: "Fecha",
      render: (row: Order) => dateFmt.format(new Date(row.created_at)),
    },
    {
      key: "actions",
      label: "",
      render: (row: Order) => (
        <Button render={<Link href={`/orders/${row.id}`} />} variant="outline" size="xs">
          Ver detalle
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Órdenes"
        description={`${total} orden${total !== 1 ? "es" : ""} en total`}
        action={{ label: "Nueva orden", href: "/orders/new" }}
      />
      <OrderFilters customers={customers} />
      <DataTable<Order>
        columns={columns}
        data={orders}
        emptyMessage="No hay órdenes que coincidan con los filtros."
      />
      <Pagination totalPages={total_pages} currentPage={page} />
    </div>
  );
}
