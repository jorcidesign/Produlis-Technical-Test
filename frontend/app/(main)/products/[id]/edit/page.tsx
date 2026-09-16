import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct } from "@/services/api";
import { ProductForm } from "@/components/organisms/product-form";
import { PageHeader } from "@/components/organisms/page-header";
import { updateProduct } from "@/actions/products";

export const metadata: Metadata = { title: "Editar producto" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) notFound();

  let product;
  try {
    product = await getProduct(productId);
  } catch {
    notFound();
  }

  const boundAction = updateProduct.bind(null, productId);

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Editar producto" description={`Modificando: ${product.name}`} />
      <ProductForm action={boundAction} product={product} />
    </div>
  );
}
