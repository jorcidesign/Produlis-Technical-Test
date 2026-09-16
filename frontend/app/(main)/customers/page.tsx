import type { Metadata } from "next";
import Link from "next/link";
import { getCustomers } from "@/services/api";
import { DataTable, type Column } from "@/components/organisms/data-table";
import { PageHeader } from "@/components/organisms/page-header";
import { SearchBar } from "@/components/organisms/search-bar";
import { Pagination } from "@/components/organisms/pagination";
import { ToggleCustomerButton } from "@/components/organisms/toggle-customer-button";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import type { Customer } from "@/services/api";

export const metadata: Metadata = { title: "Clientes" };

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search ?? "";

  const { data: customers, total_pages, total } = await getCustomers({
    page,
    search,
  });

  const columns: Column<Customer>[] = [
    { key: "name", label: "Nombre" },
    { key: "email", label: "Email" },
    {
      key: "is_active",
      label: "Estado",
      render: (row: Customer) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row: Customer) => (
        <div className="flex items-center gap-2">
          <Button
            render={<Link href={`/customers/${row.id}/edit`} />}
            variant="outline"
            size="xs"
          >
            Editar
          </Button>
          <ToggleCustomerButton id={row.id} isActive={row.is_active} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={`${total} cliente${total !== 1 ? "s" : ""} registrado${total !== 1 ? "s" : ""}`}
        action={{ label: "Nuevo cliente", href: "/customers/new" }}
      />
      <SearchBar placeholder="Buscar por nombre o email..." />
      <DataTable<Customer>
        columns={columns}
        data={customers}
        emptyMessage={
          search
            ? `Sin resultados para "${search}".`
            : "No hay clientes registrados todavía."
        }
      />
      <Pagination totalPages={total_pages} currentPage={page} />
    </div>
  );
}
