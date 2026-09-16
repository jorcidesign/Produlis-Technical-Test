import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/services/api";
import { DataTable, type Column } from "@/components/organisms/data-table";
import { PageHeader } from "@/components/organisms/page-header";
import { SearchBar } from "@/components/organisms/search-bar";
import { Pagination } from "@/components/organisms/pagination";
import { ToggleProductButton } from "@/components/organisms/toggle-product-button";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import type { Product } from "@/services/api";

export const metadata: Metadata = { title: "Productos" };

const fmt = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });

interface PageProps {
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? "1", 10));
  const search = params.search ?? "";

  const { data: products, total_pages, total } = await getProducts({ page, search });

  const columns: Column<Product>[] = [
    { key: "name", label: "Nombre" },
    {
      key: "price",
      label: "Precio",
      render: (row: Product) => fmt.format(row.price),
    },
    {
      key: "is_active",
      label: "Estado",
      render: (row: Product) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>
          {row.is_active ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Acciones",
      render: (row: Product) => (
        <div className="flex items-center gap-2">
          <Button
            render={<Link href={`/products/${row.id}/edit`} />}
            variant="outline"
            size="xs"
          >
            Editar
          </Button>
          <ToggleProductButton id={row.id} isActive={row.is_active} />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Productos"
        description={`${total} producto${total !== 1 ? "s" : ""} en catálogo`}
        action={{ label: "Nuevo producto", href: "/products/new" }}
      />
      <SearchBar placeholder="Buscar por nombre..." />
      <DataTable<Product>
        columns={columns}
        data={products}
        emptyMessage={
          search
            ? `Sin resultados para "${search}".`
            : "No hay productos registrados todavía."
        }
      />
      <Pagination totalPages={total_pages} currentPage={page} />
    </div>
  );
}
