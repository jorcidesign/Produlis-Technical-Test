import type { Metadata } from "next";
import { ProductForm } from "@/components/organisms/product-form";
import { PageHeader } from "@/components/organisms/page-header";
import { createProduct } from "@/actions/products";

export const metadata: Metadata = { title: "Nuevo producto" };

export default function NewProductPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Nuevo producto" description="Agrega un producto al catálogo." />
      <ProductForm action={createProduct} />
    </div>
  );
}
